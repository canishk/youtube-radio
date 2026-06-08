from pydantic import BaseModel

class HeartbeatRequest(BaseModel):
    session_id: str
    song_id: int | None = None
    category_id: str | None = None


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.listener_service import heartbeat, current_listener_count, get_listener_summary

router = APIRouter(prefix="/listeners", tags = ["listeners"])

@router.post("/heartbeat")
def listener_heartbeat(
    payload: HeartbeatRequest,
    db: Session = Depends(get_db)
):
    heartbeat(db, session_id=payload.session_id, song_id=payload.song_id, category_id=payload.category_id)
    db.commit()
    return {
        "success": True
    }

@router.get("/current")
def current_listeners(
    db: Session = Depends(get_db)
):
    return {
        "current_listeners": current_listener_count(db)
    }

@router.get("summary")
def listener_summary(
    db: Session = Depends(get_db)
):
    return get_listener_summary(db)
