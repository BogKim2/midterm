from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class RecipeIngredientResponse(BaseModel):
    id: int
    custom_name: str
    quantity: float
    unit: str
    is_condiment: bool
    common_ingredient_id: Optional[int]

    class Config:
        from_attributes = True


class RecipeResponse(BaseModel):
    id: int
    name: str
    category: str
    cooking_time: int
    calories: int
    instructions: str
    is_public: bool
    likes: int
    ingredients: List[RecipeIngredientResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class RecipeWithMatchRate(RecipeResponse):
    match_rate: float = 0.0
    missing_ingredients: List[str] = []
