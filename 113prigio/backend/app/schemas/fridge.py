from pydantic import BaseModel
from datetime import date
from decimal import Decimal

class IngredientCreate(BaseModel):
    name: str
    quantity: Decimal | None = None
    unit: str | None = None
    expiry_date: date | None = None
    category: str = "other"
    source: str = "manual"

class IngredientUpdate(BaseModel):
    name: str | None = None
    quantity: Decimal | None = None
    unit: str | None = None
    expiry_date: date | None = None
    category: str | None = None

class IngredientResponse(BaseModel):
    id: str
    name: str
    original_name: str | None
    quantity: float | None
    unit: str | None
    expiry_date: date | None
    category: str
    source: str
    created_at: str

    class Config:
        from_attributes = True

class FridgeResponse(BaseModel):
    id: str
    name: str
    ingredients: list[IngredientResponse]
