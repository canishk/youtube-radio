from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db

from app.services.analytics_service import track_song_play, track_song_resume, track_song_completion, track_category_entry, get_analytics_summary

router = APIRouter(prefix="/analytics", tags=["analytics"])

class AnalyticsEventRequest(BaseModel):
    event: str
    song_id: int | None = None
    category_id: str | None = None

@router.post("/event")
def anaylitcs_event(
    payload:AnalyticsEventRequest,
    db:Session = Depends(get_db)
):
    if payload.event == 'category_entered':
        track_category_entry(db, payload.category_id)
    elif payload.event == "song_play":
        track_song_play(db, payload.song_id)
    elif payload.event == "song_resume":
        track_song_resume(db, payload.song_id)
    elif payload.event == "song_complete":
        track_song_completion(db, payload.song_id, payload.category_id)
    
    return {
        "success": True
    }

@router.get("/summary")
def analytics_summary(
    db: Session = Depends(get_db)
):

    return get_analytics_summary(db)

