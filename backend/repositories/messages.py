from asyncpg import Pool

from models.conversation import MessageOut


async def get_history(
    pool: Pool,
    customer_phone: str,
    business_phone: str,
) -> list[MessageOut]:
    rows = await pool.fetch(
        """
        SELECT message, role, created_at
        FROM messages
        WHERE customer_phone = $1 AND business_phone = $2
        ORDER BY created_at ASC, id ASC
        """,
        customer_phone,
        business_phone,
    )
    return [MessageOut(**dict(r)) for r in rows]
