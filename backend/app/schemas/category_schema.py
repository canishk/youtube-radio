from pydantic import BaseModel

class CategoryCreate(BaseModel):
    id:str
    name:str
    description:str | None = None
    thumbnail:str | None = None
    auto_mode: str = "time_aware"
    enabled: bool = True

class CategoryUpdate(BaseModel):
    name:str | None = None
    description:str | None = None
    thumbnail:str | None = None
    auto_mode: str | None = None
    enabled: bool
    