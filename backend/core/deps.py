import asyncpg
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from core.config import settings
from core.database import get_pool
from core.security import decode_token

_bearer = HTTPBearer(auto_error=False)


async def get_db() -> asyncpg.Pool:
    return await get_pool()


async def get_business_phone(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    if creds:
        phone = decode_token(creds.credentials)
        if phone:
            return phone
    # TODO: remove this fallback once all clients are using JWT auth
    return settings.DEFAULT_BUSINESS_PHONE


async def require_auth(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    if not creds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    phone = decode_token(creds.credentials)
    if not phone:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return phone


async def require_process_secret(
    x_process_secret: str | None = Header(default=None),
) -> None:
    if x_process_secret != settings.PROCESS_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-Process-Secret header",
        )
