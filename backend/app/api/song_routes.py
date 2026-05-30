
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.song import Song
from app.schemas.song import SongResponse
from app.services.playback_service import select_weighted_song
from app.services.history_service import get_recently_played, log_playback
from app.services.session_service import register_session, update_last_category
from app.services.youtube_service import get_thumbnail_url

from app.utils.time_utils import get_time_bucket

router = APIRouter(prefix="/stream", tags=["Streaming"])

@router.get("/{category_id}", response_model=SongResponse)
def get_stream_song(
    category_id: str,
    session_id: str,
    hour: int = Query(12),
    db: Session = Depends(get_db)
):
    register_session(db, session_id)
    update_last_category(db, session_id, category_id)
    songs = db.query(Song).filter(Song.category_id == category_id).all()
    if not songs:
        raise HTTPException(status_code=404, detail="No songs found for this category.")
    time_bucket = get_time_bucket(hour)
    print(f"Time bucket: {time_bucket}, Hour: {hour}")
    recently_played = get_recently_played(db, session_id, category_id)
    selected_song = select_weighted_song(songs, time_bucket, recently_played, db)
    log_playback(db, session_id, category_id, selected_song.youtube_video_id)
    thumbnail = get_thumbnail_url(selected_song.youtube_video_id)
    return {
        "id": selected_song.id,
        "category_id": selected_song.category_id,
        "youtube_video_id": selected_song.youtube_video_id,
        "title": selected_song.title,
        "movie": selected_song.movie,
        "thumbnail": thumbnail,
        "moods": selected_song.get_moods(),
        "energy": int(selected_song.energy),
        "time_slots": selected_song.get_time_slots(),
        "priority": selected_song.priority,
    }
