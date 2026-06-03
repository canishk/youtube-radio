from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.db.database import Base


class MetadataSuggestion(Base):
    __tablename__ = "metadata_suggestions"

    id = Column(Integer, primary_key=True)
    song_id = Column(Integer, nullable=False)
    suggested_moods = Column(Text, nullable=True)
    suggested_time_slots = Column(Text, nullable=True)
    suggested_energy = Column(Integer, nullable=True)
    suggested_priority = Column(Integer, nullable=True)
    suggestion_source = Column(String(50), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)