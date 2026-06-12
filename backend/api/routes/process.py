import logging

from fastapi import APIRouter, Depends, HTTPException

from core.deps import get_db, require_process_secret
from core.phone import is_private_phone, normalize_phone
from models.process import ProcessIn, ProcessOut
from services.rag import process_message

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/process", response_model=ProcessOut, dependencies=[Depends(require_process_secret)])
async def process(body: ProcessIn, pool=Depends(get_db)):
    # safety net: never let the AI reply into group chats or broadcasts.
    # n8n must skip sending when reply is empty.
    if not is_private_phone(body.customer_phone):
        logger.warning("process skipped non-private chat: customer_phone=%s", body.customer_phone)
        return ProcessOut(reply="", classification="OUT_OF_SCOPE")
    try:
        return await process_message(pool, normalize_phone(body.business_phone), body.messages)
    except Exception as exc:
        logger.error("process endpoint failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=503, detail="Processing temporarily unavailable — n8n should retry")
