from pydantic import BaseModel

class RecipeCandidateRequest(BaseModel):
    ingredients: list[str]
    food_types: list[str] = []
    custom_type: str = ""
    tastes: list[str] = []

class RecipeGenerateRequest(BaseModel):
    ingredients: list[str]
    food_types: list[str] = []
    custom_type: str = ""
    tastes: list[str] = []
    selected_dish: str

class RecipeCandidate(BaseModel):
    dish: str
    description: str
    difficulty: str

class NutritionInfo(BaseModel):
    calories: float | None = None
    protein: float | None = None
    carbs: float | None = None
    fat: float | None = None

class RecipeDetail(BaseModel):
    title: str
    ingredients: list[dict]
    steps: list[str]
    cooking_time: str
    difficulty: str
    tips: str
    missing_ingredients: list[str]
    nutrition: NutritionInfo | None = None
