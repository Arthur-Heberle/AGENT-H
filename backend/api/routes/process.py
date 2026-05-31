import logging

from fastapi import APIRouter, Depends, HTTPException

from core.deps import get_db, require_process_secret
from models.process import ProcessIn, ProcessOut
from services.rag import process_message

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/process", response_model=ProcessOut, dependencies=[Depends(require_process_secret)])
async def process(body: ProcessIn, pool=Depends(get_db)):
    try:
        return await process_message(pool, body.business_phone, body.messages)
    except Exception as exc:
        logger.error("process endpoint failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=503, detail="Processing temporarily unavailable — n8n should retry")
