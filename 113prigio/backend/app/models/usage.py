import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

FREE_LIMITS = {"analysis": 5, "recipe": 10}
ADMIN_UNLIMITED = 99999

class MonthlyUsage(Base):
    __tablename__ = "monthly_usage"
    __table_args__ = (
        UniqueConstraint("user_id", "year_month", "feature", name="uq_user_year_month_feature"),
    )
    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id     = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    year_month  = Column(String(7), nullable=False)
    feature     = Column(String(50), nullable=False)
    usage_count = Column(Integer, default=0)
    limit_count = Column(Integer, default=5)
    created_at  = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at  = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="monthly_usages")
