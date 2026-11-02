from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from Database.post import get_db
from Auth.deps import get_current_user
from User.Schemas.Reel import Reel
from User.CRUD.Reel import create_reel, get_reels, get_reel, delete_reel
import models
from Minio.config import upload_file, delete_file

router = APIRouter(
    prefix="/reels",
    tags=["Reels"],
)

# Creates a new reel by uploading media
@router.post("/", response_model=Reel)
async def create_reel_endpoint(
    caption: str | None = Form(None),
    audio_name: str | None = Form(None),
    duration: int | None = Form(None),
    created_at: datetime | None = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    media_url = upload_file(file, f"Reel/{current_user.username}")
    reel_data = {
        "user_id": current_user.user_id,
        "caption": caption,
        "media_url": media_url,
        "audio_name": audio_name,
        "duration": duration,
        "created_at": created_at or datetime.utcnow(),
    }
    return await create_reel(db, reel_data)

# Lists all reels
@router.get("/", response_model=List[Reel])
async def read_reels(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)
):
    return await get_reels(db, skip=skip, limit=limit)

# Deletes a specific reel
@router.delete("/{reel_id}", response_model=dict)
async def delete_reel_endpoint(
    reel_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_reel = await get_reel(db, reel_id=reel_id)
    if db_reel is None:
        raise HTTPException(status_code=404, detail="Reel not found")
    if db_reel.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this reel")
    if db_reel.media_url:
        delete_file(db_reel.media_url)
    await delete_reel(db, reel_id=reel_id)
    # Also remove reel likes stored in MongoDB
    from Database.mongo import reel_likes_collection
    await reel_likes_collection.delete_many({"reel_id": reel_id})
    return {"message": "Reel deleted successfully"}
