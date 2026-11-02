from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from Database.post import get_db
from Auth.deps import get_current_user
from User.Schemas.PostComment import PostCommentCreate, PostComment
from User.CRUD.PostComment import create_post_comment, get_comments_by_post
import models

router = APIRouter(
    prefix="/post_comments",
    tags=["Post Comments"],
)

# Creates a new comment on a post
@router.post("/", response_model=PostComment)
async def create_post_comment_endpoint(
    post_comment: PostCommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    comment_data = post_comment.model_dump()
    comment_data["user_id"] = current_user.user_id
    comment_data["created_at"] = datetime.utcnow()
    return await create_post_comment(db, comment_data)

# Retrieves all comments for a specific post
@router.get("/post/{post_id}", response_model=List[PostComment])
async def read_post_comments_by_post(
    post_id: int, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)
):
    return await get_comments_by_post(db, post_id=post_id, skip=skip, limit=limit)
