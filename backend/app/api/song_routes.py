from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.song import Song
from app.schemas.song import SongResponse
from app.services.playback_service import select_weighted_song
from app.services.history_service import get_recently_played, log_playback

from app.utils.time_utils import get_time_bucket

router = APIRouter(prefix="/stream", tags=["Streaming"])

@router.get("/{category_id}", response_model=SongResponse)
def get_stream_song(
    category_id: str,
    hour: int = Query(12),
    db: Session = Depends(get_db)
):
    songs = db.query(Song).filter(Song.category_id == category_id).all()
    if not songs:
        return {"error": "No songs found for this category."}
    time_bucket = get_time_bucket(hour)
    print(f"Time bucket: {time_bucket}, Hour: {hour}")
    recently_played = get_recently_played(db, category_id)
    selected_song = select_weighted_song(songs, time_bucket, recently_played)
    log_playback(db, category_id, selected_song.youtube_video_id)
    return selected_song
