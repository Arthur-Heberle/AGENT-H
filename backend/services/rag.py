import logging

from asyncpg import Pool

from models.process import ChatMessage, ProcessOut
from repositories.products import similarity_search
from services.embedding import embed
from services.llm import chat

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_TEMPLATE = """\
Você é um assistente de atendimento ao cliente de uma loja de móveis.
Responda sempre em português brasileiro, de forma cordial e objetiva.

Produtos disponíveis:
{products}

REGRA CRÍTICA: Se nenhum produto corresponder ao que o cliente pediu, diga isso e \
faça uma pergunta de esclarecimento. NÃO recomende um produto errado.

Ao final da sua resposta, em uma linha separada:
CLASSIFICATION: [QUALIFIED_LEAD|GENERAL_QUESTION|GREETING|OUT_OF_SCOPE]
"""


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
    query = _build_query(messages)

    vector = await embed(query)
    products = await similarity_search(pool, business_phone, vector)

    system_content = SYSTEM_PROMPT_TEMPLATE.format(
        products=_format_products(products)
    )

    llm_messages = [{"role": "system", "content": system_content}]
    for m in messages:
        llm_messages.append({"role": m.role if m.role == "user" else "assistant", "content": m.content})

    raw_reply = await chat(llm_messages)

    # parse classification
    if "CLASSIFICATION:" in raw_reply:
        parts = raw_reply.split("CLASSIFICATION:", 1)
        reply = parts[0].strip()
        classification = parts[1].strip().split()[0] if parts[1].strip() else "GENERAL_QUESTION"
    else:
        reply = raw_reply.strip()
        classification = "GENERAL_QUESTION"

    return ProcessOut(reply=reply, classification=classification)
