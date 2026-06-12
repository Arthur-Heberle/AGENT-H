"""One-off helper to create the first dashboard login.

Usage:
    ./.venv/bin/python seed.py

Edit EMAIL / PASSWORD below before running. business_phone is taken from
DEFAULT_BUSINESS_PHONE in your .env so it matches what the API filters on.
"""
import asyncio

import asyncpg

from core.config import settings
from core.phone import normalize_phone
from core.security import hash_password

import os
from dotenv import load_dotenv
load_dotenv()
EMAIL = os.environ["EMAIL"]
PASSWORD = os.environ["PASSWORD"]
BUSINESS_NAME = os.getenv("BUSINESS_NAME")




async def seed():
    business_phone = normalize_phone(settings.DEFAULT_BUSINESS_PHONE)
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
            business_phone,
            BUSINESS_NAME,
        )
        # default per-client settings row (business_hours/system_prompt use table defaults)
        await conn.execute(
            """
            INSERT INTO client_settings (business_phone)
            VALUES ($1)
            ON CONFLICT (business_phone) DO NOTHING
            """,
            business_phone,
        )
        print(f"Seeded client: {EMAIL}  (business_phone={business_phone})")
        print(f"Login with:  {EMAIL} / {PASSWORD}")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(seed())
