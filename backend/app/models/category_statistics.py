from sqlalchemy import Column, Integer, DateTime, ForeignKey, String
from sqlalchemy.sql import func

from app.db.database import Base

class CategoryStatistics(Base):
    __tablename__ = "category_statistics"
    category_id = Column(
        String,
        ForeignKey("categories.id"),
        primary_key=True
    )
    entry_count = Column(
        Integer,
        nullable=False,
        default=0
    )
    completion_count = Column(
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