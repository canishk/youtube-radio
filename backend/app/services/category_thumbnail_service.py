import random

from sqlalchemy.orm import Session

from app.models.category import Category
from app.services.category_recommendation_service import get_playable_songs
from app.services.youtube_service import get_thumbnail_url


def _is_thumbnail_missing(thumbnail: str | None) -> bool:
    return not thumbnail or not thumbnail.strip()


def assign_random_category_thumbnail(db: Session, category: Category) -> str | None:
    songs = get_playable_songs(db, category.id)
    if not songs:
        return None

    song = random.choice(songs)
    thumbnail = get_thumbnail_url(song.youtube_video_id)
    category.thumbnail = thumbnail
    return thumbnail


def ensure_category_thumbnail(db: Session, category: Category) -> str | None:
    if not _is_thumbnail_missing(category.thumbnail):
        return category.thumbnail
    return assign_random_category_thumbnail(db, category)
