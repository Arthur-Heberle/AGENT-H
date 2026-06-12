from asyncpg import Pool
from fastapi import HTTPException

from models.settings import BusinessHours, ProfileOut, ProfileIn, SettingsIn, SettingsOut


async def get_settings(pool: Pool, business_phone: str) -> SettingsOut:
    row = await pool.fetchrow(
        "SELECT system_prompt, ai_language, business_hours FROM client_settings WHERE business_phone = $1",
        business_phone,
    )
    if not row:
        return SettingsOut(system_prompt=None, ai_language="auto", business_hours=BusinessHours())
    hours_raw = dict(row["business_hours"]) if row["business_hours"] else {}
    return SettingsOut(
        system_prompt=row["system_prompt"],
        ai_language=row["ai_language"],
        business_hours=BusinessHours(**hours_raw),
    )


async def upsert_settings(pool: Pool, business_phone: str, data: SettingsIn) -> SettingsOut:
    # jsonb codec on the pool encodes dicts; passing a pre-dumped string would double-encode
    hours = data.business_hours.model_dump()
    await pool.execute(
        """
        INSERT INTO client_settings (business_phone, system_prompt, ai_language, business_hours, updated_at)
        VALUES ($1, $2, $3, $4::jsonb, NOW())
        ON CONFLICT (business_phone)
        DO UPDATE SET system_prompt = $2, ai_language = $3, business_hours = $4::jsonb, updated_at = NOW()
        """,
        business_phone,
        data.system_prompt,
        data.ai_language,
        hours,
    )
    return await get_settings(pool, business_phone)


async def get_profile(pool: Pool, business_phone: str) -> ProfileOut:
    row = await pool.fetchrow(
        "SELECT email, business_name, business_phone FROM clients WHERE business_phone = $1",
        business_phone,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfileOut(**dict(row))


async def update_profile(pool: Pool, business_phone: str, data: ProfileIn) -> ProfileOut:
    if data.email is not None:
        conflict = await pool.fetchrow(
            "SELECT id FROM clients WHERE email = $1 AND business_phone != $2",
            data.email,
            business_phone,
        )
        if conflict:
            raise HTTPException(status_code=409, detail="Email already in use")
        await pool.execute(
            "UPDATE clients SET email = $1 WHERE business_phone = $2",
            data.email,
            business_phone,
        )
    if data.business_name is not None:
        await pool.execute(
            "UPDATE clients SET business_name = $1 WHERE business_phone = $2",
            data.business_name,
            business_phone,
        )
    return await get_profile(pool, business_phone)


async def delete_account(pool: Pool, business_phone: str) -> None:
    await pool.execute(
        "DELETE FROM client_settings WHERE business_phone = $1",
        business_phone,
    )
    await pool.execute(
        "DELETE FROM clients WHERE business_phone = $1",
        business_phone,
    )
