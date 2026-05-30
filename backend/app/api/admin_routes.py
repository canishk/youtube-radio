from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from app.db.session import get_db
from app.models.song import Song
from app.models.category import Category
from app.schemas.category_schema import CategoryCreate, CategoryUpdate
from app.schemas.song_schema import SongCreate, SongUpdate

router = APIRouter(prefix="/admin", tags=["Admin Categories"])

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