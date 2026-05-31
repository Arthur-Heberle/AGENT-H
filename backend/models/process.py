from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str   # 'user' | 'assistant' (n8n transport format)
    content: str


class ProcessIn(BaseModel):
    customer_phone: str
    business_phone: str
    messages: list[ChatMessage]


class ProcessOut(BaseModel):
    reply: str
    classification: str
