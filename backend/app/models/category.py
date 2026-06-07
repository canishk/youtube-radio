from sqlalchemy import Column,String, Boolean
from app.db.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    thumbnail = Column(String, nullable=True)
    auto_mode = Column(String, default="time-aware")
    enabled  = Column(Boolean, nullable=False ,default=True)

