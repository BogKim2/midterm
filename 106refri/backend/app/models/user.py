from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    image_url = Column(String)
    provider = Column(String, default="google")
    default_servings = Column(Integer, default=2)
    preferences_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    fridge_items = relationship(
        "FridgeItem", back_populates="user", cascade="all, delete-orphan"
    )
    meal_plans = relationship(
        "MealPlan", back_populates="user", cascade="all, delete-orphan"
    )
    shopping_items = relationship(
        "ShoppingListItem", back_populates="user", cascade="all, delete-orphan"
    )
