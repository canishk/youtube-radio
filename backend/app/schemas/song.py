from pydantic import BaseModel
from typing import Optional

class SongBase(BaseModel):
    category_id: str
    youtube_video_id: str
    title: Optional[str] = None
    movie: Optional[str] = None
    moods: Optional[str] = None
    energy: Optional[str] = None
    time_slots: Optional[str] = None
    priority: Optional[int] = 5

class SongResponse(SongBase):
    id: int

    class Config:
        from_attributes = True
