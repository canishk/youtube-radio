from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db

from app.services.analytics_service import track_song_play, track_song_resume, track_song_completion, track_category_entry, get_analytics_summary
from app.services.analytics_dashboard_service import get_dashboard_data, get_top_songs, get_top_categories, get_top_moods

router = APIRouter(prefix="/analytics", tags=["analytics"])

class AnalyticsEventRequest(BaseModel):
    event: str
    song_id: int | None = None
    category_id: str | None = None
    session_id: str | None = None

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
        track_song_completion(db, payload.song_id, payload.category_id, payload.session_id)
    elif payload.event == "song_skip":
        pass

    return {
        "success": True
    }

@router.get("/summary")
def analytics_summary(
    db: Session = Depends(get_db)
):

    return get_analytics_summary(db)

@router.get("/top-songs")
def top_songs(db: Session = Depends(get_db)):
    return get_top_songs(db)

@router.get("/top-categories")
def top_categories(db: Session = Depends(get_db)):
    return get_top_categories(db)

@router.get("/top-moods")
def top_moods(db: Session = Depends(get_db)):
    return get_top_moods(db)

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    return get_dashboard_data(db)