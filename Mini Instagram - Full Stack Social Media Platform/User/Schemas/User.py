from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date, datetime

class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone_no: Optional[str] = None
    dob: Optional[date] = None
    bio: Optional[str] = None
    profile_pic_url: Optional[str] = None
    role_id: int

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone_no: Optional[str] = None
    dob: Optional[date] = None
    bio: Optional[str] = None
    profile_pic_url: Optional[str] = None
    password: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)
    created_at: Optional[datetime] = None

class User(UserBase):
    user_id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
