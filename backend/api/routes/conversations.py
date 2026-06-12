from fastapi import APIRouter, Depends
from urllib.parse import unquote

from core.deps import require_auth, get_db
from models.conversation import ConversationOut, MessageOut, ToggleAIIn, ToggleAIOut
from repositories.conversations import list_conversations, toggle_ai
from repositories.messages import get_history

router = APIRouter()


@router.get("/conversations", response_model=list[ConversationOut])
async def get_conversations(
    limit: int = 50,
    pool=Depends(get_db),
    business_phone: str = Depends(require_auth),
):
    return await list_conversations(pool, business_phone, limit)


@router.get("/conversations/{customer_phone}/messages", response_model=list[MessageOut])
async def get_messages(
    customer_phone: str,
    pool=Depends(get_db),
    business_phone: str = Depends(require_auth),
):
    phone = unquote(customer_phone)
    return await get_history(pool, phone, business_phone)


@router.put("/conversations/{customer_phone}/toggle-ai", response_model=ToggleAIOut)
async def toggle_ai_route(
    customer_phone: str,
    body: ToggleAIIn,
    pool=Depends(get_db),
    business_phone: str = Depends(require_auth),
):
    phone = unquote(customer_phone)
    ai_enabled = await toggle_ai(pool, phone, business_phone, body.ai_enabled)
    return ToggleAIOut(customer_phone=phone, ai_enabled=ai_enabled)
