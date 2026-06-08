from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.db.database import Base

class ActiveSession(Base):
    __tablename__ = "active_sessions"

    session_id = Column(String, primary_key=True)
    current_song_id = Column(Integer, ForeignKey("songs.id"), nullable=True)
    current_category_id = Column(String, ForeignKey("categories.id"), nullable=True)
    last_seen_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    