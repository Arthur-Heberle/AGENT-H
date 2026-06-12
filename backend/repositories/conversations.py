from asyncpg import Pool

from models.conversation import ConversationOut


async def list_conversations(
    pool: Pool,
    business_phone: str,
    limit: int = 50,
) -> list[ConversationOut]:
    rows = await pool.fetch(
        """
        SELECT
            all_customers.customer_phone,
            c.customer_name,
            COALESCE(c.ai_enabled, TRUE) AS ai_enabled,
            last_m.message      AS last_message,
            last_m.created_at   AS last_message_time
        FROM (
            SELECT DISTINCT customer_phone
            FROM messages
            WHERE business_phone = $1
        ) AS all_customers
        JOIN LATERAL (
            SELECT message, created_at
            FROM messages
            WHERE customer_phone = all_customers.customer_phone
              AND business_phone  = $1
            ORDER BY created_at DESC
            LIMIT 1
        ) last_m ON true
        LEFT JOIN conversations c
            ON c.customer_phone = all_customers.customer_phone
            AND c.business_phone = $1
        ORDER BY last_m.created_at DESC NULLS LAST
        LIMIT $2
        """,
        business_phone,
        limit,
    )
    result = []
    for r in rows:
        d = dict(r)
        d["status"] = "active" if d["ai_enabled"] else "paused"
        result.append(ConversationOut(**d))
    return result


async def toggle_ai(
    pool: Pool,
    customer_phone: str,
    business_phone: str,
    ai_enabled: bool,
) -> bool:
    await pool.execute(
        """
        INSERT INTO conversations (customer_phone, business_phone, ai_enabled, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (customer_phone, business_phone)
        DO UPDATE SET ai_enabled = EXCLUDED.ai_enabled, updated_at = NOW()
        """,
        customer_phone,
        business_phone,
        ai_enabled,
    )
    return ai_enabled
