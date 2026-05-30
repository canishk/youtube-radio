from sqlalchemy import Column, String, Integer, Boolean, DateTime
from datetime import datetime

from app.db.database import Base

class VideoHealth(Base):
    __tablename__ = "video_health"
    youtube_video_id = Column(String, primary_key=True, index=True)
    is_playable = Column(Boolean, default=True)
    failure_count = Column(Integer, default=0)
    last_failure_reason = Column(String, nullable=True)
    last_checked = Column(DateTime, default=datetime.utcnow)
    