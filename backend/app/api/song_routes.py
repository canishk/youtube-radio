from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.song import Song
from app.services.playback_service import select_weighted_song
from app.utils.time_utils import get_time_bucket

router = APIRouter(prefix="/stream", tags=["Streaming"])

@router.get("/{category_id}")
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
    selected_song = select_weighted_song(songs, time_bucket)
    return selected_song
