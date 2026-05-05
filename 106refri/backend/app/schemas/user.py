from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class UserBase(BaseModel):
    email: str
    name: Optional[str] = None
    image_url: Optional[str] = None


class UserCreate(UserBase):
    provider: str = "google"


class UserResponse(UserBase):
    id: int
    provider: str
    default_servings: int
    preferences_json: Any
    created_at: datetime

    class Config:
        from_attributes = True


class UserPreferencesUpdate(BaseModel):
    default_servings: Optional[int] = None
    preferences_json: Optional[dict] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
