from datetime import datetime

from pydantic import BaseModel


class ConversationOut(BaseModel):
    customer_phone: str
    customer_name: str | None
    last_message: str | None
    last_message_time: datetime | None
    status: str  # 'active' | 'paused'
    ai_enabled: bool


class MessageOut(BaseModel):
    message: str
    role: str
    created_at: datetime


class ToggleAIIn(BaseModel):
    ai_enabled: bool


class ToggleAIOut(BaseModel):
    customer_phone: str
    ai_enabled: bool
