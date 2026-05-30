from pydantic import BaseModel
from typing import Optional, List

class SongCreate(BaseModel):
    category_id: str
    youtube_video_id: str
    title: Optional[str] = None
    movie: Optional[str] = None
    thumbnail: Optional[str] = None
    moods: Optional[List[str]] = None
    energy: int = 5
    time_slots: Optional[List[str]] = None
    priority: Optional[int] = 5

class SongUpdate(BaseModel):
    category_id: Optional[str] = None
    youtube_video_id: Optional[str] = None
    title: Optional[str] = None
    movie: Optional[str] = None
    thumbnail: Optional[str] = None
    moods: Optional[List[str]] = None
    energy: Optional[int] = None
    time_slots: Optional[List[str]] = None
    priority: Optional[int] = None