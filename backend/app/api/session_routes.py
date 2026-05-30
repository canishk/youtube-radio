from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session


from app.db.session import get_db
from app.services.session_service import register_session, update_last_category, get_session_info

router = APIRouter(prefix="/session", tags=["Sessions"])

@router.get("/current")
def get_current_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    session_info = get_session_info(db, session_id)
    if not session_info:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {
        "session_id": session_info.session_id,
        "last_category": session_info.last_category,
        "last_seen_at": session_info.last_seen_at
    }