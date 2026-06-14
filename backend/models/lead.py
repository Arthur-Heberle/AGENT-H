from datetime import datetime

from pydantic import BaseModel


class LeadOut(BaseModel):
    business_phone: str
    customer_phone: str
    customer_name: str | None
    summary: str | None
    status: str
    created_at: datetime
    updated_at: datetime


class LeadStatusIn(BaseModel):
    status: str
