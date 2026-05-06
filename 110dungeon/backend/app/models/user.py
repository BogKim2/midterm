from sqlalchemy import Column, String, DateTime, Text
from datetime import datetime
import uuid
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id         = Column(Text, primary_key=True, default=lambda: str(uuid.uuid4()))
    email      = Column(String, unique=True, nullable=False)
    name       = Column(String)
    picture    = Column(String)
    google_id  = Column(String, unique=True)
    plan       = Column(String, default="free")
    created_at = Column(DateTime, default=datetime.utcnow)
