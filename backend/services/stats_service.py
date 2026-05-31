from asyncpg import Pool

from models.stats import DayVolume, StatsOut


def _delta_pct(today: int, yesterday: int) -> float:
    if yesterday == 0:
        return 100.0 if today > 0 else 0.0
    return round((today - yesterday) / yesterday * 100, 1)


async def get_stats(pool: Pool, business_phone: str) -> StatsOut:
    # conversations today vs yesterday
    conv_row = await pool.fetchrow(
        """
        SELECT
            COUNT(DISTINCT CASE WHEN created_at::date = CURRENT_DATE THEN customer_phone END)     AS today,
            COUNT(DISTINCT CASE WHEN created_at::date = CURRENT_DATE - 1 THEN customer_phone END) AS yesterday
        FROM messages
        WHERE business_phone = $1 AND role = 'customer'
          AND created_at >= CURRENT_DATE - 1
        """,
        business_phone,
    )
    conv_today = conv_row["today"] or 0
    conv_yesterday = conv_row["yesterday"] or 0

    # avg response time today (seconds between customer msg → next assistant msg)
    avg_row = await pool.fetchrow(
        """
        SELECT AVG(EXTRACT(EPOCH FROM (a.created_at - c.created_at))) AS avg_s
        FROM messages c
        JOIN LATERAL (
            SELECT created_at FROM messages
            WHERE customer_phone = c.customer_phone
              AND business_phone  = c.business_phone
              AND role = 'assistant'
              AND created_at > c.created_at
            ORDER BY created_at ASC
            LIMIT 1
        ) a ON true
        WHERE c.business_phone = $1
          AND c.role = 'customer'
          AND c.created_at::date = CURRENT_DATE
        """,
        business_phone,
    )
    avg_s = float(avg_row["avg_s"]) if avg_row and avg_row["avg_s"] is not None else None

    # human handoffs today (conversations with owner message today)
    handoff_row = await pool.fetchrow(
        """
        SELECT COUNT(DISTINCT customer_phone) AS cnt
        FROM messages
        WHERE business_phone = $1 AND role = 'owner'
          AND created_at::date = CURRENT_DATE
        """,
        business_phone,
    )
    handoffs = handoff_row["cnt"] or 0

    # leads today vs yesterday
    leads_row = await pool.fetchrow(
        """
        SELECT
            COUNT(DISTINCT CASE WHEN created_at::date = CURRENT_DATE THEN customer_phone END)     AS today,
            COUNT(DISTINCT CASE WHEN created_at::date = CURRENT_DATE - 1 THEN customer_phone END) AS yesterday
        FROM messages
        WHERE business_phone = $1 AND classification = 'QUALIFIED_LEAD'
          AND created_at >= CURRENT_DATE - 1
        """,
        business_phone,
    )
    leads_today = leads_row["today"] or 0
    leads_yesterday = leads_row["yesterday"] or 0

    # volume last 7 days
    vol_rows = await pool.fetch(
        """
        SELECT created_at::date AS date, COUNT(*) AS cnt
        FROM messages
        WHERE business_phone = $1
          AND role = 'customer'
          AND created_at >= CURRENT_DATE - 6
        GROUP BY created_at::date
        ORDER BY date ASC
        """,
        business_phone,
    )
    volume_7d = [DayVolume(date=str(r["date"]), count=r["cnt"]) for r in vol_rows]

    return StatsOut(
        conversations_today=conv_today,
        conversations_delta_pct=_delta_pct(conv_today, conv_yesterday),
        avg_response_time_s=avg_s,
        human_handoffs_today=handoffs,
        leads_today=leads_today,
        leads_delta_pct=_delta_pct(leads_today, leads_yesterday),
        volume_7d=volume_7d,
    )
