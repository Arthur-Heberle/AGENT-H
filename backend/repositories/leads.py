from asyncpg import Pool

from models.lead import LeadOut


async def upsert_lead(
    pool: Pool,
    business_phone: str,
    customer_phone: str,
    customer_name: str | None,
    summary: str | None,
) -> None:
    await pool.execute(
        """
        INSERT INTO leads (business_phone, customer_phone, customer_name, summary, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (business_phone, customer_phone) DO UPDATE
          SET summary     = EXCLUDED.summary,
              customer_name = COALESCE(EXCLUDED.customer_name, leads.customer_name),
              updated_at  = NOW()
        """,
        business_phone,
        customer_phone,
        customer_name,
        summary,
    )


async def list_leads(pool: Pool, business_phone: str) -> list[LeadOut]:
    rows = await pool.fetch(
        """
        SELECT business_phone, customer_phone, customer_name, summary, status, created_at, updated_at
        FROM leads
        WHERE business_phone = $1
        ORDER BY updated_at DESC
        """,
        business_phone,
    )
    return [LeadOut(**dict(r)) for r in rows]


async def update_status(
    pool: Pool, business_phone: str, customer_phone: str, status: str
) -> bool:
    result = await pool.execute(
        "UPDATE leads SET status=$3, updated_at=NOW() WHERE business_phone=$1 AND customer_phone=$2",
        business_phone,
        customer_phone,
        status,
    )
    return result == "UPDATE 1"
