from typing import Literal

from pydantic import BaseModel

from app.schemas.category import CategoryResponse


class CategoryExhaustedResponse(BaseModel):
    exhausted: Literal[True] = True
    current_category_id: str
    recommended_category: CategoryResponse | None
    shared_moods: list[str]
