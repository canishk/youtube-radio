from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base

class Session(Base):
    __tablename__ = "sessions"

    session_id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    last_category = Column(String, nullable=True)
    last_song_id = Column(Integer, ForeignKey("songs.id"), nullable=True)
    last_song_started_at = Column(DateTime, nullable=True)
    last_song = relationship("Song", foreign_keys=[last_song_id])
    playback_position_seconds = Column(Integer, default=0)
    last_position_updated_at = Column(DateTime, nullable=True)

