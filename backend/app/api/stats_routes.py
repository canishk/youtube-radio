from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.services.stats_service import get_current_listener_count

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/listeners")
def get_listeners(db: Session = Depends(get_db)):
    count = get_current_listener_count(db)
    return {"current_listeners": count}
