from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ReelBase(BaseModel):
    user_id: int
    caption: Optional[str] = None
    media_url: str
    audio_name: Optional[str] = None
    duration: Optional[int] = None
    created_at: Optional[datetime] = None

class Reel(ReelBase):
    reel_id: int

    model_config = ConfigDict(from_attributes=True)
