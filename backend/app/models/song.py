from sqlalchemy import Column, Integer, String
import json

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

    def get_moods(self):
        return json.loads(self.moods) if self.moods else []
    
    def get_time_slots(self):
        return json.loads(self.time_slots) if self.time_slots else []
