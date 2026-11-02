from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from Database.post import get_db
from Auth.deps import get_current_user
from User.Schemas.Follower import FollowerCreate, Follower
from User.CRUD.Follower import (
    create_follower,
    get_followers,
    get_follower,
    delete_follower,
)
import models

router = APIRouter(
    prefix="/followers",
    tags=["Followers"],
)

# Creates a new follower
@router.post("/", response_model=Follower)
async def create_follower_endpoint(
    follower: FollowerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    follower_data = follower.model_dump()
    follower_data["follower_id"] = current_user.user_id
    if follower_data.get("followed_at") and follower_data["followed_at"].tzinfo:
        follower_data["followed_at"] = follower_data["followed_at"].replace(tzinfo=None)
    return await create_follower(db, follower_data)

# Lists all followers
@router.get("/", response_model=List[Follower])
async def read_followers(
    follower_id: Optional[int] = None,
    following_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 1000,
    db: AsyncSession = Depends(get_db)
):
    return await get_followers(db, follower_id=follower_id, following_id=following_id, skip=skip, limit=limit)

# Retrieves a specific follower relationship between two users
@router.get("/{follower_id}/{following_id}", response_model=Follower)
async def read_follower(
    follower_id: int, following_id: int, db: AsyncSession = Depends(get_db)
):
    db_follower = await get_follower(db, follower_id=follower_id, following_id=following_id)
    if db_follower is None:
        raise HTTPException(status_code=404, detail="Follower not found")
    return db_follower

# Deletes a specific follower (unfollow)
@router.delete("/{follower_id}/{following_id}", response_model=dict)
async def delete_follower_endpoint(
    follower_id: int,
    following_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_follower_check = await get_follower(db, follower_id=follower_id, following_id=following_id)
    if db_follower_check is None:
        raise HTTPException(status_code=404, detail="Follower not found")
    if db_follower_check.follower_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this follow")
    db_follower = await delete_follower(db, follower_id=follower_id, following_id=following_id)
    if db_follower is None:
        raise HTTPException(status_code=404, detail="Follower not found")
    return {"message": "Follower deleted successfully"}
