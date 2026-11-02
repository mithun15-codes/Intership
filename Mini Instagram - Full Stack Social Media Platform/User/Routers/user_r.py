from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from Database.post import get_db
from Auth.deps import get_current_user
from User.Schemas.User import User, UserUpdate
from User.CRUD.User import get_users, get_user, update_user
import models
from Minio.config import upload_file, delete_file

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

# Retrieves the profile details
@router.get("/me", response_model=dict)
async def get_profile(
    current_user=Depends(get_current_user),
):
    return {
        "user_id": current_user.user_id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "bio": current_user.bio,
        "phone_no": current_user.phone_no,
        "profile_pic_url": current_user.profile_pic_url,
        "role": current_user.role.role_name if current_user.role else None,
    }

# Lists all users
@router.get("/", response_model=List[User])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return await get_users(db, skip=skip, limit=limit)

# Retrieves the details of a specific user by id
@router.get("/{user_id}", response_model=User)
async def read_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_user = await get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Updates a user's profile
@router.put("/{user_id}", response_model=User)
async def update_user_endpoint(
    user_id: int,
    user: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to update this user."
        )

    db_user = await get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user.model_dump(exclude_unset=True)

    return await update_user(db, user_id=user_id, user_data=user_data)

# Uploads or updates profile picture for authenticated user
@router.post("/profile_picture", response_model=User)
async def update_profile_picture(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Delete old profile picture from MinIO if exists
    if current_user.profile_pic_url:
        delete_file(current_user.profile_pic_url)

    # Upload profile picture to MinIO
    profile_pic_url = upload_file(file, f"Profile/{current_user.username}")
        
    # Update user in DB
    return await update_user(db, user_id=current_user.user_id, user_data={"profile_pic_url": profile_pic_url})

# Deletes profile picture for authenticated user
@router.delete("/profile_picture", response_model=User)
async def delete_profile_picture_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.profile_pic_url:
        delete_file(current_user.profile_pic_url)
    return await update_user(db, user_id=current_user.user_id, user_data={"profile_pic_url": None})
