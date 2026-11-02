from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ReelLikeBase(BaseModel):
    user_id: Optional[int] = None
    reel_id: int

class ReelLikeCreate(ReelLikeBase):
    pass

class ReelLikeResponse(ReelLikeBase):
    like_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
