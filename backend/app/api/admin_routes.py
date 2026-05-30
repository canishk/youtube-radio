from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.category import Category
from app.schemas.category_schema import CategoryCreate, CategoryUpdate

router = APIRouter(prefix="/admin", tags=["Admin"])

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