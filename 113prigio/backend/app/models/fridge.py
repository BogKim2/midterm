import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

CATEGORIES = [
    "vegetable", "fruit", "meat_fish", "dairy", "cooked",
    "egg_convenience", "ready_made", "sauce", "beverage", "grain", "other"
]
CATEGORY_KO = {
    "vegetable": "채소", "fruit": "과일", "meat_fish": "육류·수산",
    "dairy": "유제품", "cooked": "조리식품", "egg_convenience": "달걀·간편식",
    "ready_made": "즉석·통조림", "sauce": "소스·양념", "beverage": "음료",
    "grain": "곡물·면", "other": "기타",
}

class Refrigerator(Base):
    __tablename__ = "refrigerators"
    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name       = Column(String(255), default="내 냉장고")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user        = relationship("User", back_populates="refrigerator")
    ingredients = relationship("Ingredient", back_populates="refrigerator", cascade="all, delete-orphan")

class Ingredient(Base):
    __tablename__ = "ingredients"
    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    refrigerator_id = Column(UUID(as_uuid=True), ForeignKey("refrigerators.id", ondelete="CASCADE"), nullable=False, index=True)
    name            = Column(String(255), nullable=False)
    original_name   = Column(String(255))
    quantity        = Column(Numeric(10, 2))
    unit            = Column(String(50))
    expiry_date     = Column(Date)
    category        = Column(String(50), default="other")
    source          = Column(String(50), default="manual")
    created_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    refrigerator = relationship("Refrigerator", back_populates="ingredients")
