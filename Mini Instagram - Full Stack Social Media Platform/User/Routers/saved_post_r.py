from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy.future import select
from sqlalchemy import delete

from Database.post import get_db
from Auth.deps import get_current_user
from User.Schemas.SavedPost import SavedPostCreate, SavedPost
from User.CRUD.SavedPost import create_saved_post
import models

router = APIRouter(
    prefix="/saved_posts",
    tags=["Saved Posts"],
)

# Toggles a saved post
@router.post("/toggle", response_model=dict)
async def toggle_saved_post_endpoint(
    saved_post: SavedPostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    result = await db.execute(
        select(models.SavedPost)
        .where(models.SavedPost.post_id == saved_post.post_id, models.SavedPost.user_id == current_user.user_id)
    )
    db_save = result.scalars().first()
    if db_save:
        await db.execute(delete(models.SavedPost).where(models.SavedPost.saved_post_id == db_save.saved_post_id))
        await db.commit()
        return {"status": "unsaved"}
    else:
        save_data = {"post_id": saved_post.post_id, "user_id": current_user.user_id}
        await create_saved_post(db, save_data)
        return {"status": "saved"}

# Retrieves saved record for a specific post by current user
@router.get("/post/{post_id}", response_model=List[SavedPost])
async def read_saved_for_post(post_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SavedPost).where(models.SavedPost.post_id == post_id))
    return result.scalars().all()
