from pydantic import BaseModel

class DetectedIngredient(BaseModel):
    name: str
    quantity: float | None = None
    unit: str | None = None
    confidence: float

class AnalysisResponse(BaseModel):
    detected_ingredients: list[DetectedIngredient]
    model_used: str
    has_vision: bool
    analysis: dict
