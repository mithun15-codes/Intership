from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class SavedPostBase(BaseModel):
    post_id: int
    user_id: Optional[int] = None
    saved_at: Optional[datetime] = None

class SavedPostCreate(SavedPostBase):
    pass

class SavedPost(SavedPostBase):
    saved_post_id: int

    model_config = ConfigDict(from_attributes=True)
