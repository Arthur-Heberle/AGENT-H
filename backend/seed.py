"""One-off helper to create the first dashboard login.

Usage:
    ./.venv/bin/python seed.py

Edit EMAIL / PASSWORD below before running. business_phone is taken from
DEFAULT_BUSINESS_PHONE in your .env so it matches what the API filters on.
"""
import asyncio

import asyncpg

from core.config import settings
from core.security import hash_password

import os
EMAIL = os.environ["SEED_EMAIL"]
PASSWORD = os.environ["SEED_PASSWORD"]
BUSINESS_NAME = os.environ["SEED_BUSINESS_NAME"]




async def seed():
    conn = await asyncpg.connect(settings.DATABASE_URL)
    try:
        await conn.execute(
            """
            INSERT INTO clients (email, password_hash, business_phone, business_name)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO UPDATE
              SET password_hash = EXCLUDED.password_hash,
                  business_phone = EXCLUDED.business_phone,
                  business_name = EXCLUDED.business_name
            """,
            EMAIL,
            hash_password(PASSWORD),
            settings.DEFAULT_BUSINESS_PHONE,
            BUSINESS_NAME,
        )
        # default per-client settings row (business_hours/system_prompt use table defaults)
        await conn.execute(
            """
            INSERT INTO client_settings (business_phone)
            VALUES ($1)
            ON CONFLICT (business_phone) DO NOTHING
            """,
            settings.DEFAULT_BUSINESS_PHONE,
        )
        print(f"Seeded client: {EMAIL}  (business_phone={settings.DEFAULT_BUSINESS_PHONE})")
        print(f"Login with:  {EMAIL} / {PASSWORD}")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(seed())
