from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class StoryBase(BaseModel):
    media_url: str
    media_type: Optional[str] = None

class StoryCreate(StoryBase):
    pass

class Story(StoryBase):
    story_id: int
    user_id: int
    created_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
