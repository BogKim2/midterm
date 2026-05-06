from sqlalchemy import Column, String, DateTime, Integer, Boolean, ForeignKey, Text
from datetime import datetime
import uuid
from app.core.database import Base


class Game(Base):
    __tablename__ = "games"

    id             = Column(Text, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id        = Column(Text, ForeignKey("users.id"), nullable=False)
    title          = Column(String)
    world_json     = Column(Text, nullable=False)
    character_json = Column(Text, nullable=False)
    summary        = Column(Text)
    turn_count     = Column(Integer, default=0)
    hardcore_mode  = Column(Boolean, default=False)
    status         = Column(String, default="active")
    snapshot_json  = Column(Text, nullable=True)
    snapshot_turn  = Column(Integer, nullable=True)
    created_at     = Column(DateTime, default=datetime.utcnow)
    last_played    = Column(DateTime, default=datetime.utcnow)
