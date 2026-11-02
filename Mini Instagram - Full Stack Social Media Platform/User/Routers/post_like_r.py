from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy.future import select
from sqlalchemy import delete

from Database.post import get_db
from Auth.deps import get_current_user
from User.Schemas.PostLike import PostLikeCreate, PostLike
from User.CRUD.PostLike import create_post_like
import models

router = APIRouter(
    prefix="/post_likes",
    tags=["Post Likes"],
)

# Toggles a like for a post
@router.post("/toggle", response_model=dict)
async def toggle_post_like_endpoint(
    post_like: PostLikeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    result = await db.execute(
        select(models.PostLike)
        .where(models.PostLike.post_id == post_like.post_id, models.PostLike.user_id == current_user.user_id)
    )
    db_like = result.scalars().first()
    if db_like:
        await db.execute(delete(models.PostLike).where(models.PostLike.like_id == db_like.like_id))
        await db.commit()
        return {"status": "unliked"}
    else:
        like_data = {"post_id": post_like.post_id, "user_id": current_user.user_id}
        await create_post_like(db, like_data)
        return {"status": "liked"}

# Retrieves all likes for a specific post
@router.get("/post/{post_id}", response_model=List[PostLike])
async def read_likes_for_post(post_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.PostLike).where(models.PostLike.post_id == post_id))
    return result.scalars().all()
