import logging
from datetime import datetime
from zoneinfo import ZoneInfo

from asyncpg import Pool

from models.process import ChatMessage, ProcessOut
from repositories.products import similarity_search
from services.embedding import embed
from services.llm import chat

logger = logging.getLogger(__name__)

_DEFAULT_SYSTEM_PROMPT = (
    "Você é um assistente de atendimento ao cliente de uma loja de móveis. "
    "Responda de forma cordial e objetiva.\n\n"
    "REGRA CRÍTICA: Se nenhum produto corresponder ao que o cliente pediu, diga isso e "
    "faça uma pergunta de esclarecimento. NÃO recomende um produto errado."
)

_CLASSIFICATION_SUFFIX = (
    "\n\nAo final da sua resposta, em uma linha separada:\n"
    "CLASSIFICATION: [QUALIFIED_LEAD|GENERAL_QUESTION|GREETING|OUT_OF_SCOPE]"
)

_CLOSED_REPLY = "Estamos fora do horário de atendimento. Retornaremos em breve."

_TZ = ZoneInfo("America/Sao_Paulo")

_DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]


def _is_open(business_hours: dict) -> bool:
    now = datetime.now(_TZ)
    day_key = _DAY_KEYS[now.weekday()]
    day = business_hours.get(day_key, {})
    if not day.get("enabled", False):
        return False
    current = now.strftime("%H:%M")
    return day.get("open", "00:00") <= current <= day.get("close", "23:59")


def _build_query(messages: list[ChatMessage]) -> str:
    customer_msgs = [m for m in messages if m.role in ("user", "customer")]
    last_few = customer_msgs[-3:]
    if last_few and len(last_few[-1].content) < 20 and len(customer_msgs) > len(last_few):
        last_few = customer_msgs[-(len(last_few) + 1):]
    return " ".join(m.content for m in last_few)


def _format_products(products: list[dict]) -> str:
    if not products:
        return "(nenhum produto encontrado)"
    lines = []
    for p in products:
        price = f"R${p['price']:.2f}" if p["price"] else "preço a consultar"
        qty = f"estoque: {p['quantity']}" if p.get("quantity") is not None else ""
        line = f"- {p['name']} ({p['category'] or 'sem categoria'}) | {price} | {qty}"
        if p.get("description"):
            line += f"\n  {p['description']}"
        if p.get("specs"):
            line += f"\n  Especificações: {p['specs']}"
        lines.append(line)
    return "\n".join(lines)


async def process_message(
    pool: Pool,
    business_phone: str,
    messages: list[ChatMessage],
) -> ProcessOut:
    # Load per-client settings and enforce business hours in one query
    row = await pool.fetchrow(
        "SELECT system_prompt, ai_language, business_hours FROM client_settings WHERE business_phone = $1",
        business_phone,
    )

    hours = dict(row["business_hours"]) if row and row["business_hours"] else {}
    if hours and not _is_open(hours):
        return ProcessOut(reply=_CLOSED_REPLY, classification="OUT_OF_SCOPE")

    base_prompt = (row["system_prompt"] if row and row["system_prompt"] else _DEFAULT_SYSTEM_PROMPT).strip()

    lang = row["ai_language"] if row else "auto"
    if lang == "pt":
        lang_instruction = "\nSempre responda em português do Brasil."
    elif lang == "en":
        lang_instruction = "\nAlways reply in English."
    else:
        lang_instruction = ""

    query = _build_query(messages)
    vector = await embed(query)
    products = await similarity_search(pool, business_phone, vector)

    products_block = f"\n\nProdutos disponíveis:\n{_format_products(products)}"
    system_content = base_prompt + lang_instruction + products_block + _CLASSIFICATION_SUFFIX

    llm_messages = [{"role": "system", "content": system_content}]
    for m in messages:
        llm_messages.append({"role": m.role if m.role == "user" else "assistant", "content": m.content})

    raw_reply = await chat(llm_messages)

    if "CLASSIFICATION:" in raw_reply:
        parts = raw_reply.split("CLASSIFICATION:", 1)
        reply = parts[0].strip()
        classification = parts[1].strip().split()[0] if parts[1].strip() else "GENERAL_QUESTION"
    else:
        reply = raw_reply.strip()
        classification = "GENERAL_QUESTION"

    return ProcessOut(reply=reply, classification=classification)
