from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: Optional[str] = None
    google_id: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str