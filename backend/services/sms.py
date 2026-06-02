import logging

import httpx

from core.config import settings

logger = logging.getLogger(__name__)


async def send_otp(to: str, code: str) -> None:
    if not settings.EVOLUTION_API_URL:
        logger.warning("Evolution API not configured — OTP for %s: %s", to, code)
        return

    phone = "".join(c for c in to if c.isdigit())
    msg = f"Seu código de verificação é: *{code}*\nVálido por 10 minutos."
    url = f"{settings.EVOLUTION_API_URL}/message/sendText/{settings.EVOLUTION_INSTANCE}"

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            url,
            json={"number": phone, "text": msg},
            headers={"apikey": settings.EVOLUTION_API_KEY},
        )
        resp.raise_for_status()
