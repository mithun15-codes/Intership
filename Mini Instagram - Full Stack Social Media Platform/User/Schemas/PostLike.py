from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class PostLikeBase(BaseModel):
    post_id: int
    user_id: Optional[int] = None
    liked_at: Optional[datetime] = None

class PostLikeCreate(PostLikeBase):
    pass

class PostLike(PostLikeBase):
    like_id: int

    model_config = ConfigDict(from_attributes=True)
