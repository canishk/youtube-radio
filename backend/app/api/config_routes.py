from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.services.config_service import get_public_config

router = APIRouter(
    prefix="/config",
    tags=["Configuration"]
)


@router.get("/public")
def get_config(db: Session = Depends(get_db)):

    return get_public_config(db)