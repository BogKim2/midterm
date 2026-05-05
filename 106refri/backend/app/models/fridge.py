from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class FridgeItem(Base):
    __tablename__ = "fridge_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    common_ingredient_id = Column(Integer, ForeignKey("common_ingredients.id"), nullable=True)
    name = Column(String, nullable=False)
    category = Column(String, default="기타")
    quantity = Column(Float, default=1.0)
    unit = Column(String, default="개")
    expires_at = Column(DateTime, nullable=True)
    is_condiment = Column(Boolean, default=False)
    memo = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="fridge_items")
    common_ingredient = relationship("CommonIngredient")
