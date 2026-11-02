from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from Database.post import get_db
from Auth.deps import get_current_user
from User.Schemas.Post import Post
from User.CRUD.Post import create_post, get_posts, get_post, delete_post
import models
from Minio.config import upload_file, delete_file

router = APIRouter(
    prefix="/posts",
    tags=["Posts"],
)

# Creates a new post by uploading media and saving post details for the authenticated user
@router.post("/", response_model=Post)
async def create_post_endpoint(
    caption: str | None = Form(None),
    media_type: str | None = Form(None),
    location: str | None = Form(None),
    created_at: datetime | None = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    media_url = upload_file(file, f"Post/{current_user.username}")

    if created_at and created_at.tzinfo:
        created_at = created_at.replace(tzinfo=None)
    elif not created_at:
        created_at = datetime.utcnow()

    post_data = {
        "user_id": current_user.user_id,
        "caption": caption,
        "media_url": media_url,
        "media_type": media_type,
        "location": location,
        "created_at": created_at
    }

    return await create_post(db, post_data)

# Lists all posts
@router.get("/", response_model=List[Post])
async def read_posts(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)
):
    return await get_posts(db, skip=skip, limit=limit)

# Deletes a specific post by post id
@router.delete("/{post_id}", response_model=dict)
async def delete_post_endpoint(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_post = await get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    if db_post.media_url:
        delete_file(db_post.media_url)
    await delete_post(db, post_id=post_id)
    return {"message": "Post deleted successfully"}
