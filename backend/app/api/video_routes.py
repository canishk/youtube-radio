from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.video_health_service import record_failure

router = APIRouter(prefix="/video", tags=["Video Health"])

@router.post("/failure")
async def report_failure(
    payload: dict,
    db: Session = Depends(get_db)
):
    record_failure(db, payload.get("youtube_video_id"), payload.get("reason"))
    return {"message": "Failure recorded", "status": "recorded"}
