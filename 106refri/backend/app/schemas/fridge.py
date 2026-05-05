from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class FridgeItemBase(BaseModel):
    name: str
    category: str = "기타"
    quantity: float = 1.0
    unit: str = "개"
    expires_at: Optional[datetime] = None
    is_condiment: bool = False
    memo: str = ""


class FridgeItemCreate(FridgeItemBase):
    common_ingredient_id: Optional[int] = None


class FridgeItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    expires_at: Optional[datetime] = None
    is_condiment: Optional[bool] = None
    memo: Optional[str] = None


class FridgeItemResponse(FridgeItemBase):
    id: int
    user_id: int
    common_ingredient_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BulkAddRequest(BaseModel):
    items: List[FridgeItemCreate]
