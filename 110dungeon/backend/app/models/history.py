from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey
from datetime import datetime
import uuid
from app.core.database import Base


class History(Base):
    __tablename__ = "histories"

    id          = Column(Text, primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id     = Column(Text, ForeignKey("games.id", ondelete="CASCADE"))
    turn        = Column(Integer, nullable=False)
    role        = Column(String, nullable=False)
    content     = Column(Text, nullable=False)
    state_diff  = Column(Text)
    token_count = Column(Integer, default=0)
    created_at  = Column(DateTime, default=datetime.utcnow)
