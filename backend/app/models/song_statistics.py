from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.db.database import Base

class SongStatistics(Base):
    __tablename__ = "song_statistics"
    song_id = Column(
        Integer,
        ForeignKey("songs.id"),
        primary_key=True
    )
    play_count = Column(
        Integer,
        nullable=False,
        default=0
    )
    completion_count = Column(
        Integer,
        nullable=False,
        default=0
    )
    resume_count = Column(
        Integer,
        nullable=False,
        default=0
    )
    last_played_at = Column(
        DateTime,
        nullable=True
    )
    created_at = Column(
        DateTime,
        server_default=func.now()
    )
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )