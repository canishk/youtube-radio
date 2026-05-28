from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func

from app.db.session import get_db
from app.models.song import Song

router = APIRouter(prefix="/stream", tags=["Streaming"])

@router.get("/{category_id}")
def get_stream_song(
    category_id: str,
    db: Session = Depends(get_db)
):
    song = db.query(Song).filter(Song.category_id == category_id).order_by(func.random()).first()
    
    if not song:
        return {"message": "No songs available for this category."}
    return song