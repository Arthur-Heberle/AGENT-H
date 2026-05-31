from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from core.database import get_pool
from core.security import create_token, verify_password

router = APIRouter()


class LoginIn(BaseModel):
    email: str
    password: str


class LoginOut(BaseModel):
    token: str
    business_phone: str


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
    token = create_token(row["business_phone"])
    return LoginOut(token=token, business_phone=row["business_phone"])


@router.post("/api/auth/logout")
async def logout():
    # JWT is stateless; client discards the token
    return {"ok": True}
