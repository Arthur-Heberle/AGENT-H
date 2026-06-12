import logging
from datetime import datetime
from zoneinfo import ZoneInfo

from asyncpg import Pool

from core.config import settings
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
    "\n\nAo final da sua resposta, em linhas separadas:\n"
    "CLASSIFICATION: [QUALIFIED_LEAD|GENERAL_QUESTION|GREETING|OUT_OF_SCOPE]\n"
    "Se QUALIFIED_LEAD, adicione também: LEAD_SUMMARY: <resumo em 1-2 frases do que o cliente precisa>"
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


def _split_messages(
    messages: list[ChatMessage],
) -> tuple[list[ChatMessage], list[ChatMessage]] | None:
    """Partition by processing_status: answer only 'in_progress', drop 'pending',
    everything else ('done' or missing status) is conversation context.
    Returns None for legacy payloads where no message carries a status."""
    if not any(m.processing_status for m in messages):
        return None
    context = [m for m in messages if m.processing_status not in ("in_progress", "pending")]
    to_answer = [m for m in messages if m.processing_status == "in_progress"]
    return context, to_answer


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

    split = _split_messages(messages)
    if split is not None:
        context_msgs, to_answer = split
        if not to_answer:
            logger.warning("process: no in_progress message for business=%s — skipping LLM", business_phone)
            return ProcessOut(reply="", classification="OUT_OF_SCOPE")
        query = (
            " ".join(m.content for m in to_answer if m.role in ("user", "customer"))
            or " ".join(m.content for m in to_answer)
        )
        prompt_messages = context_msgs + to_answer
        answer_note = (
            "\nAs mensagens anteriores da conversa já foram respondidas; "
            "responda APENAS às últimas mensagens do cliente."
        )
    else:
        # legacy payload without processing_status: keep previous behavior
        query = _build_query(messages)
        prompt_messages = messages
        answer_note = ""

    vector = await embed(query)
    retrieved = await similarity_search(pool, business_phone, vector)

    products = [p for p in retrieved if (p["similarity"] or 0) >= settings.MIN_SIMILARITY]
    dropped = len(retrieved) - len(products)
    logger.info(
        "RAG business=%s query=%r retrieved=%d kept=%d dropped=%d (min_similarity=%.2f): %s",
        business_phone,
        query,
        len(retrieved),
        len(products),
        dropped,
        settings.MIN_SIMILARITY,
        [(p["name"], round(p["similarity"] or 0, 3)) for p in retrieved],
    )

    products_block = f"\n\nProdutos disponíveis:\n{_format_products(products)}"
    system_content = base_prompt + lang_instruction + answer_note + products_block + _CLASSIFICATION_SUFFIX

    llm_messages = [{"role": "system", "content": system_content}]
    for m in prompt_messages:
        llm_messages.append({"role": m.role if m.role == "user" else "assistant", "content": m.content})

    raw_reply = await chat(llm_messages)

    lead_summary: str | None = None

    if "CLASSIFICATION:" in raw_reply:
        parts = raw_reply.split("CLASSIFICATION:", 1)
        reply = parts[0].strip()
        tail = parts[1].strip()
        classification = tail.split()[0] if tail else "GENERAL_QUESTION"
        if "LEAD_SUMMARY:" in tail:
            lead_summary = tail.split("LEAD_SUMMARY:", 1)[1].strip().splitlines()[0].strip()
    else:
        reply = raw_reply.strip()
        classification = "GENERAL_QUESTION"

    if classification != "QUALIFIED_LEAD":
        lead_summary = None

    return ProcessOut(reply=reply, classification=classification, lead_summary=lead_summary)
