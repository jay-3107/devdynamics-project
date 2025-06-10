from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from decimal import Decimal

class ResponseBase(BaseModel):
    success: bool
    message: str

class DataResponse(ResponseBase):
    data: Any

class ErrorResponse(ResponseBase):
    success: bool = False
    detail: Optional[str] = None

class PersonBalance(BaseModel):
    name: str
    total_paid: Decimal
    total_share: Decimal
    balance: Decimal  # Positive if owed money, negative if owes money

class Settlement(BaseModel):
    from_person: str
    to_person: str
    amount: Decimal