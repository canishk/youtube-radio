from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.category import Category
from app.models.song import Song
from app.schemas.category import CategoryResponse
from app.services.category_thumbnail_service import ensure_category_thumbnail

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).filter(Category.enabled == True).join(Song, Song.category_id == Category.id).distinct().all()

    for category in categories:
        ensure_category_thumbnail(db, category)

    db.commit()
    return categories

