from pydantic import BaseModel
from typing import Optional

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    auto_mode: Optional[str] = "time-aware"

class CategoryResponse(CategoryBase):
    id: str

    class Config:
        from_attributes = True
