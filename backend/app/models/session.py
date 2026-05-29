from sqlalchemy import Column, String, DateTime
from datetime import datetime

from app.db.database import Base

class Session(Base):
    __tablename__ = "sessions"

    session_id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    last_category = Column(String, nullable=True)
