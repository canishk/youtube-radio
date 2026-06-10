from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.db.database import Base

class SessionSongHistory(Base):
    __tablename__ = "session_song_history"

    id = Column(Integer, primary_key=True)
    session_id = Column(String, nullable=False, index=True)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)
    category_id = Column(String, nullable=True)
    played_at = Column(DateTime, nullable=False, server_default=func.now())
