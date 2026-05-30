from pydantic import BaseModel

class AdminLoginRequest(BaseModel):
    access_key: str
    