from sqlalchemy import  Column, String, Integer, DateTime
from datetime import datetime

from app.db.database import Base

class PlaybackHistory(Base):
    __tablename__ = "playback_history"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    category_id = Column(String, nullable=False)
    youtube_video_id = Column(String, nullable=False)
    played_at = Column(DateTime, default=datetime.utcnow)
    
