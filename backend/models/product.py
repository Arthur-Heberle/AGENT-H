from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class ProductIn(BaseModel):
    name: str
    category: str | None = None
    price: Decimal | None = None
    quantity: int = 0
    description: str | None = None
    specs: str | None = None


class ProductOut(BaseModel):
    id: int
    name: str
    category: str | None
    price: Decimal | None
    quantity: int
    description: str | None
    specs: str | None
    active: bool
    updated_at: datetime
