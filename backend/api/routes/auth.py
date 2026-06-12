import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from core.database import get_pool
from core.phone import normalize_phone
from core.security import create_token, hash_password, verify_password
from services.sms import send_otp

router = APIRouter()

# In-memory OTP store: phone → {code, expires_at, data:{name,email,password_hash}}
_otp_store: dict[str, dict] = {}


# ── Models ─────────────────────────────────────────────────────────────────

class LoginIn(BaseModel):
    email: str
    password: str


class LoginOut(BaseModel):
    token: str
    business_phone: str


class RegisterIn(BaseModel):
    phone: str
    name: str
    email: str
    password: str


class VerifyOTPIn(BaseModel):
    phone: str
    code: str


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.post("/api/auth/login", response_model=LoginOut)
async def login(body: LoginIn, pool=Depends(get_pool)):
    row = await pool.fetchrow(
        "SELECT id, password_hash, business_phone FROM clients WHERE email = $1",
        body.email,
    )
    if not row or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    phone = normalize_phone(row["business_phone"])
    token = create_token(phone)
    return LoginOut(token=token, business_phone=phone)


@router.post("/api/auth/logout")
async def logout():
    return {"ok": True}


@router.post("/api/auth/register")
async def register(body: RegisterIn, pool=Depends(get_pool)):
    body = body.model_copy(update={"phone": normalize_phone(body.phone)})
    phone_exists = await pool.fetchval(
        "SELECT 1 FROM clients WHERE business_phone = $1", body.phone
    )
    if phone_exists:
        raise HTTPException(status_code=409, detail="Phone already registered")

    email_exists = await pool.fetchval(
        "SELECT 1 FROM clients WHERE email = $1", body.email
    )
    if email_exists:
        raise HTTPException(status_code=409, detail="Email already registered")

    code = str(secrets.randbelow(1_000_000)).zfill(6)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    _otp_store[body.phone] = {
        "code": code,
        "expires_at": expires_at,
        "data": {
            "name": body.name,
            "email": body.email,
            "password_hash": hash_password(body.password),
        },
    }

    await send_otp(body.phone, code)
    return {"ok": True}


@router.post("/api/auth/verify-otp", response_model=LoginOut)
async def verify_otp(body: VerifyOTPIn, pool=Depends(get_pool)):
    body = body.model_copy(update={"phone": normalize_phone(body.phone)})
    entry = _otp_store.get(body.phone)
    if not entry:
        raise HTTPException(status_code=404, detail="No pending registration for this phone")

    if datetime.now(timezone.utc) > entry["expires_at"]:
        _otp_store.pop(body.phone, None)
        raise HTTPException(status_code=400, detail="Code expired")

    if entry["code"] != body.code:
        raise HTTPException(status_code=400, detail="Invalid code")

    d = entry["data"]
    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                """
                INSERT INTO clients (email, password_hash, business_phone, business_name)
                VALUES ($1, $2, $3, $4)
                """,
                d["email"],
                d["password_hash"],
                body.phone,
                d["name"],
            )
            await conn.execute(
                """
                INSERT INTO client_settings (business_phone)
                VALUES ($1)
                ON CONFLICT (business_phone) DO NOTHING
                """,
                body.phone,
            )

    _otp_store.pop(body.phone, None)
    token = create_token(body.phone)
    return LoginOut(token=token, business_phone=body.phone)
