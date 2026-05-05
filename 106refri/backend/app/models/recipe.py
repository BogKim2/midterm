from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, default="한식")
    cooking_time = Column(Integer, default=30)
    calories = Column(Integer, default=400)
    instructions = Column(Text, default="")
    is_public = Column(Boolean, default=True)
    likes = Column(Integer, default=0)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    ingredients = relationship(
        "RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan"
    )


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    common_ingredient_id = Column(
        Integer, ForeignKey("common_ingredients.id"), nullable=True
    )
    custom_name = Column(String, default="")
    quantity = Column(Float, default=1.0)
    unit = Column(String, default="개")
    is_condiment = Column(Boolean, default=False)

    recipe = relationship("Recipe", back_populates="ingredients")
    common_ingredient = relationship("CommonIngredient")


class RecipeLike(Base):
    __tablename__ = "recipe_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
