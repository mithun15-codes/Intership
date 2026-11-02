from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from Database.post import get_db
from Auth.deps import get_current_user
from User.Schemas.ReelComment import ReelCommentCreate, ReelComment
from User.CRUD.ReelComment import create_reel_comment, get_comments_by_reel
import models

router = APIRouter(
    prefix="/reel_comments",
    tags=["Reel Comments"],
)

# Creates a new comment on a reel
@router.post("/", response_model=ReelComment)
async def create_reel_comment_endpoint(
    reel_comment: ReelCommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    comment_data = reel_comment.model_dump()
    comment_data["user_id"] = current_user.user_id
    comment_data["created_at"] = datetime.utcnow()
    return await create_reel_comment(db, comment_data)

# Retrieves all comments for a specific reel
@router.get("/reel/{reel_id}", response_model=List[ReelComment])
async def read_reel_comments_by_reel(
    reel_id: int, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)
):
    return await get_comments_by_reel(db, reel_id=reel_id, skip=skip, limit=limit)
