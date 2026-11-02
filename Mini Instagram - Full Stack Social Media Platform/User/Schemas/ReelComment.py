from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ReelCommentBase(BaseModel):
    reel_id: int
    user_id: Optional[int] = None
    comment_text: str
    created_at: Optional[datetime] = None

class ReelCommentCreate(ReelCommentBase):
    pass

class ReelComment(ReelCommentBase):
    comment_id: int

    model_config = ConfigDict(from_attributes=True)
