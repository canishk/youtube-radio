import os
from fastapi import APIRouter, HTTPException

from app.schemas.admin_schema import AdminLoginRequest

router = APIRouter(prefix="/admin/auth", tags=["Admin Authentication"])

@router.post("")
def admin_login(
    payload: AdminLoginRequest
):

    expected_key = os.getenv("ADMIN_ACCESS_KEY")


    if payload.access_key != expected_key:
        raise HTTPException(
            status_code=401,
            detail="Invalid access key"
        )

    return {
        "authentication": True
    }