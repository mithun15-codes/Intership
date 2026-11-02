from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class FollowerBase(BaseModel):
    follower_id: int
    following_id: int
    followed_at: Optional[datetime] = None

class FollowerCreate(FollowerBase):
    pass

class Follower(FollowerBase):
    model_config = ConfigDict(from_attributes=True)
