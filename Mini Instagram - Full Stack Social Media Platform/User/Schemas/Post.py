from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class PostBase(BaseModel):
    user_id: int
    caption: Optional[str] = None
    media_url: str
    media_type: Optional[str] = None
    location: Optional[str] = None
    created_at: Optional[datetime] = None

class Post(PostBase):
    post_id: int

    model_config = ConfigDict(from_attributes=True)
