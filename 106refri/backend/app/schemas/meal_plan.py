from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MealPlanCreate(BaseModel):
    date: str
    meal_type: str
    recipe_id: Optional[int] = None
    servings: int = 2


class MealPlanResponse(BaseModel):
    id: int
    user_id: int
    date: str
    meal_type: str
    recipe_id: Optional[int]
    servings: int
    created_at: datetime

    class Config:
        from_attributes = True


class GenerateMealPlanRequest(BaseModel):
    days: int = 7
    meal_types: List[str] = ["breakfast", "lunch", "dinner"]
    start_date: str


class ShoppingItemCreate(BaseModel):
    name: str
    category: str = "기타"
    quantity: float = 1.0
    unit: str = "개"
    source: str = "manual"


class ShoppingItemUpdate(BaseModel):
    checked: Optional[bool] = None
    quantity: Optional[float] = None
    name: Optional[str] = None


class ShoppingItemResponse(BaseModel):
    id: int
    user_id: int
    name: str
    category: str
    quantity: float
    unit: str
    checked: bool
    source: str
    created_at: datetime

    class Config:
        from_attributes = True
