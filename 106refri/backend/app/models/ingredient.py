from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base


class CommonIngredient(Base):
    __tablename__ = "common_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)
    default_unit = Column(String, default="개")
    is_condiment = Column(Boolean, default=False)
