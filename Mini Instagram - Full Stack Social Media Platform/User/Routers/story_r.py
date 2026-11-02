from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import timedelta, datetime

from Database.post import get_db
from Auth.deps import get_current_user
import models
from User.Schemas.Story import Story, StoryCreate
from User.CRUD.Story import (
    create_story,
    get_story,
    delete_story,
    get_all_active_stories,
)
from Minio.config import upload_file, delete_file

router = APIRouter(
    prefix="/stories",
    tags=["Stories"],
)

# Uploads a new story
@router.post("/", response_model=Story)
async def upload_story(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ext = file.filename.split(".")[-1]
    media_url = upload_file(file, f"Stories/{current_user.username}")
    media_type = "video" if ext in ["mp4", "mov", "avi"] else "image"
    
    story_data = StoryCreate(media_url=media_url, media_type=media_type)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    return await create_story(db, story_data, current_user.user_id, expires_at)

# Retrieves all active stories
@router.get("/", response_model=List[Story])
async def get_all_stories(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return await get_all_active_stories(db)

# Deletes a specific story by id (owner only)
@router.delete("/{story_id}", response_model=dict)
async def delete_story_endpoint(
    story_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_story = await get_story(db, story_id=story_id)
    if db_story is None:
        raise HTTPException(status_code=404, detail="Story not found")
    if db_story.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this story")
    if db_story.media_url:
        delete_file(db_story.media_url)
    await delete_story(db, story_id=story_id)
    return {"message": "Story deleted successfully"}
