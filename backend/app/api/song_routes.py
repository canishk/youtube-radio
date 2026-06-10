
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.song import SongResponse
from app.schemas.stream import CategoryExhaustedResponse
from app.services.playback_service import select_weighted_song
from app.services.history_service import get_recently_played, get_session_played_video_ids, log_playback
from app.services.session_service import register_session, update_last_category
from app.services.youtube_service import get_thumbnail_url
from app.services.category_recommendation_service import (
    get_playable_songs,
    recommend_similar_category,
)

from app.utils.time_utils import get_time_bucket

router = APIRouter(prefix="/stream", tags=["Streaming"])

NO_CACHE_HEADERS = {"Cache-Control": "no-store", "Pragma": "no-cache"}


def category_exhausted_response(
    category_id: str,
    recommended,
    shared_moods: list[str],
) -> JSONResponse:
    detail = CategoryExhaustedResponse(
        current_category_id=category_id,
        recommended_category=recommended,
        shared_moods=shared_moods,
    ).model_dump()
    return JSONResponse(
        status_code=410,
        content={"detail": detail},
        headers=NO_CACHE_HEADERS,
    )


@router.get("/{category_id}", response_model=SongResponse)
def get_stream_song(
    category_id: str,
    session_id: str,
    response: Response,
    hour: int = Query(12),
    db: Session = Depends(get_db),
):
    register_session(db, session_id)
    update_last_category(db, session_id, category_id)
    time_bucket = get_time_bucket(hour)

    playable_songs = get_playable_songs(db, category_id)
    if not playable_songs:
        recommended, shared_moods = recommend_similar_category(
            db, category_id, session_id, time_bucket
        )
        return category_exhausted_response(category_id, recommended, shared_moods)

    played_video_ids = get_session_played_video_ids(db, session_id, category_id)
    unplayed_songs = [
        song for song in playable_songs
        if song.youtube_video_id not in played_video_ids
    ]

    if not unplayed_songs:
        recommended, shared_moods = recommend_similar_category(
            db, category_id, session_id, time_bucket
        )
        return category_exhausted_response(category_id, recommended, shared_moods)

    recently_played = get_recently_played(db, session_id, category_id)
    selected_song = select_weighted_song(
        unplayed_songs, time_bucket, recently_played, session_id, db
    )
    if not selected_song:
        raise HTTPException(status_code=500, detail="Could not select a song from the category.")

    log_playback(db, session_id, category_id, selected_song.youtube_video_id)
    thumbnail = get_thumbnail_url(selected_song.youtube_video_id)

    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"

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
