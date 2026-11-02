from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class SavedReelBase(BaseModel):
    reel_id: int
    user_id: Optional[int] = None
    saved_at: Optional[datetime] = None

class SavedReelCreate(SavedReelBase):
    pass

class SavedReel(SavedReelBase):
    saved_reel_id: int

    model_config = ConfigDict(from_attributes=True)
