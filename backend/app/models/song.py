from sqlalchemy import Column, Integer, String
from app.db.database import Base

class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(String, nullable=False)
    youtube_video_id = Column(String, nullable=False)
    title = Column(String)
    movie = Column(String)
    moods = Column(String)
    energy = Column(String)

    time_slots = Column(String)
    priority = Column(Integer, default=5)
