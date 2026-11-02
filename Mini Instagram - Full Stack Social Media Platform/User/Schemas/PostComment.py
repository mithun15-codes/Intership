from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class PostCommentBase(BaseModel):
    post_id: int
    user_id: Optional[int] = None
    comment_text: str
    created_at: Optional[datetime] = None

class PostCommentCreate(PostCommentBase):
    pass

class PostComment(PostCommentBase):
    comment_id: int

    model_config = ConfigDict(from_attributes=True)
