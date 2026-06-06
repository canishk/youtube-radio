from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from app.db.session import get_db
from app.models.song import Song
from app.models.category import Category
from app.models.video_health import VideoHealth
from app.schemas.category_schema import CategoryCreate, CategoryUpdate
from app.schemas.song_schema import SongCreate, SongUpdate
from app.services.youtube_service import fetch_video_metadata
from app.services.metadata_suggestion_service import generate_suggestions
from app.services.groq_metadata_service import generate_ai_suggestions
from app.services.dashboard_service import get_dashboard_data, get_metadata_gaps

from app.utils.youtube import extract_video_id


router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/categories")
def get_categories(
    db: Session = Depends(get_db)
):

    return (
        db.query(Category)
        .order_by(Category.name)
        .all()
    )

@router.post("/categories")
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db)
):

    existing = (
        db.query(Category)
        .filter(
            Category.id == payload.id
        )
        .first()
    )

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    category = Category(
        **payload.model_dump()
    )

    db.add(category)

    db.commit()

    return category


@router.put("/categories/{category_id}")
def update_category(
    category_id: str,
    payload: CategoryUpdate,
    db: Session = Depends(get_db)
):

    category = (
        db.query(Category)
        .filter(
            Category.id == category_id
        )
        .first()
    )

    if not category:

        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    data = payload.model_dump()

    for key, value in data.items():

        setattr(
            category,
            key,
            value
        )

    db.commit()

    return category

@router.delete("/categories/{category_id}")
def delete_category(
    category_id: str,
    db: Session = Depends(get_db)
):
    
    song_count = db.query(Song).filter(Song.category_id == category_id).count()
    if song_count > 0:

        raise HTTPException(
            status_code=400,
            detail="Category contains songs"
        )

    category = (
        db.query(Category)
        .filter(
            Category.id == category_id
        )
        .first()
    )

    if not category:

        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    db.delete(category)

    db.commit()

    return {
        "status": "deleted"
    }

@router.get("/songs")
def get_songs(
    db: Session = Depends(get_db)
):

    songs = (
        db.query(Song)
        .order_by(Song.title)
        .all()
    )

    response = []

    for song in songs:

        response.append({
            "id": song.id,
            "category_id": song.category_id,
            "youtube_video_id":
                song.youtube_video_id,
            "title": song.title,
            "movie": song.movie,
            "moods":
                song.get_moods(),
            "time_slots":
                song.get_time_slots(),
            "energy": int(song.energy),
            "priority": song.priority
        })

    return response

@router.post("/songs")
def create_song(
    payload: SongCreate,
    db: Session = Depends(get_db)
):

    category = (
        db.query(Category)
        .filter(
            Category.id == payload.category_id
        )
        .first()
    )

    if not category:

        raise HTTPException(
            status_code=400,
            detail="Category does not exist"
        )

    song = Song(
        category_id=payload.category_id,
        youtube_video_id=payload.youtube_video_id,
        title=payload.title,
        movie=payload.movie,
        moods=json.dumps(payload.moods) if payload.moods else None,
        time_slots=json.dumps(payload.time_slots) if payload.time_slots else None,
        energy=payload.energy,
        priority=payload.priority

    )

    db.add(song)

    db.commit()

    return {
        "id": song.id,
    }

@router.put("/songs/{song_id}")
def update_song(
    song_id: int,
    payload: SongUpdate,
    db: Session = Depends(get_db)
):

    song = (
        db.query(Song)
        .filter(
            Song.id == song_id
        )
        .first()
    )

    if not song:

        raise HTTPException(
            status_code=404,
            detail="Song not found"
        )

    song.category_id = payload.category_id or song.category_id
    # song.youtube_video_id = payload.youtube_video_id or song.youtube_video_id
    song.title = payload.title or song.title
    song.movie = payload.movie or song.movie
    song.moods = json.dumps(payload.moods) if payload.moods is not None else song.moods
    song.time_slots = json.dumps(payload.time_slots) if payload.time_slots is not None else song.time_slots
    song.energy = payload.energy if payload.energy is not None else song.energy
    song.priority = payload.priority if payload.priority is not None else song.priority

    db.commit()

    return {
        "status": "updated"
    }

@router.delete("/songs/{song_id}")
def delete_song(
    song_id: int,
    db: Session = Depends(get_db)
):
    song = (
        db.query(Song)
        .filter(
            Song.id == song_id
        )
        .first()
    )

    if not song:

        raise HTTPException(
            status_code=404,
            detail="Song not found"
        )

    db.delete(song)

    db.commit()

    return {
        "status": "deleted"
    }

@router.get("/video-health")
def get_video_health(
    db: Session = Depends(get_db)
):

    records = db.query(VideoHealth).order_by(VideoHealth.failure_count.desc()).all()

    return [
        {
            "youtube_video_id":
                item.youtube_video_id,

            "is_playable":
                item.is_playable,

            "failure_count":
                item.failure_count,

            "last_failure_reason":
                item.last_failure_reason,

            "last_checked":
                item.last_checked
        }
        for item in records
    ]

@router.post("/video-health/{video_id}/enable")
def enable_video(
    video_id: str,
    db: Session = Depends(get_db)
):

    video = db.query(VideoHealth).filter(VideoHealth.youtube_video_id == video_id).first()

    if not video:

        raise HTTPException(
            status_code=404,
            detail="Video not found"
        )

    video.is_playable = True
    video.failure_count = 0
    video.last_failure_reason = None
    db.commit()

    return {
        "status": "enabled"
    }


@router.post("/youtube/metadata")
def youtube_metadata(
    payload: dict,
    db: Session = Depends(get_db)
):
    youtube_url = payload.get("youtube_url")
    video_id = extract_video_id(youtube_url)
    metadata = fetch_video_metadata(video_id)

    if not metadata:
        raise HTTPException(
            status_code=404,
            detail="Video not found"
        )
    
    existing_song = db.query(Song).filter(Song.youtube_video_id == video_id).first()
    metadata["already_exists"] = existing_song is not None
    return metadata

@router.post("/songs/{song_id}/suggest")
def generate_song_suggestion(
    song_id: int,
    db: Session = Depends(get_db)
):
    song = db.query(Song).filter(Song.id == song_id).first()

    if not song:
        raise HTTPException(
            status_code=404,
            detail="Song not found"
        )

    metadata =  fetch_video_metadata(song.youtube_video_id)

    if not metadata:
        raise HTTPException(
            status_code=404,
            detail="Video metadata not found"
        )
    suggestion = generate_suggestions(
        title=metadata.get("title"),
        movie=metadata.get("movie"),
        channel_name=metadata.get("channel"),
        description=metadata.get("description")
    )


    return {
        "song_id": song_id,
        "video_title": metadata.get("title"),
        "channel": metadata.get("channel"),
        # "description": metadata.get("description"),
        "suggestion": suggestion
    }


@router.post("/songs/{song_id}/suggest-ai")
def generate_ai_song_suggestion(
    song_id: int,
    db: Session = Depends(get_db)
):
    song = db.query(Song).filter(Song.id == song_id).first()

    if not song:
        raise HTTPException(
            status_code=404,
            detail="Song not found"
        )

    metadata =  fetch_video_metadata(song.youtube_video_id)

    if not metadata:
        raise HTTPException(
            status_code=404,
            detail="Video metadata not found"
        )
    suggestion = generate_ai_suggestions(
        title=metadata.get("title"),
        movie=metadata.get("movie"),
        channel_name=metadata.get("channel"),
        description=metadata.get("description")
    )


    return {
        "song_id": song_id,
        "engine": "groq",
        "suggestion": suggestion
    }
@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db)
):
    try:
        data = get_dashboard_data(db)
        return data
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/metadata-gaps")
def metadata_gaps(db: Session = Depends(get_db)):
    return get_metadata_gaps(db)

