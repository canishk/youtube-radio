from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel


from app.db.session import get_db
from app.services.session_service import register_session, get_session_info, update_current_song, update_playback_position
from app.services.history_service import clear_category_play_history
from app.services.youtube_service import get_thumbnail_url

router = APIRouter(prefix="/session", tags=["Sessions"])

@router.get("/current")
def get_current_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    session_info = get_session_info(db, session_id)
    if not session_info:
        raise HTTPException(status_code=404, detail="Session not found.")
    thumbnail = get_thumbnail_url(session_info.last_song.youtube_video_id) if session_info.last_song else None
    return {
        "session_id": session_info.session_id,
        "last_category": session_info.last_category,
        "last_seen_at": session_info.last_seen_at,
        "last_song": {
            "id": session_info.last_song.id,
            "title": session_info.last_song.title,
            "youtube_video_id": session_info.last_song.youtube_video_id,
            "thumbnail": thumbnail
        } if session_info.last_song else None,
        "playback_position_seconds": session_info.playback_position_seconds,
        "last_position_updated_at": session_info.last_position_updated_at,
        "last_song_started_at": session_info.last_song_started_at

    }

class CurrentSongRequest(BaseModel):
    session_id: str
    song_id: int
    category_id: str

@router.post("/current-song")
def update_session_song(
    payload: CurrentSongRequest,
    db: Session = Depends(get_db)
):
    session = update_current_song(db, payload.session_id, payload.song_id, payload.category_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"success": True, "message": "Current song updated successfully."}

class PlaybackPositionRequest(BaseModel):
    session_id: str
    song_id: int
    position_seconds: int

@router.post("/playback-position")
def save_playback_position(
    payload: PlaybackPositionRequest,
    db: Session = Depends(get_db)
):
    session = update_playback_position(db, session_id=payload.session_id, song_id=payload.song_id, position_seconds=payload.position_seconds)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"success": True, "message": "Playback position updated successfully."}

class CategoryHistoryResetRequest(BaseModel):
    session_id: str
    category_id: str

@router.post("/category-history/reset")
def reset_category_history(
    payload: CategoryHistoryResetRequest,
    db: Session = Depends(get_db),
):
    register_session(db, payload.session_id)
    clear_category_play_history(db, payload.session_id, payload.category_id)
    return {"success": True}