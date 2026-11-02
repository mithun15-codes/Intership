from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

import models
from Auth.password import hash_password

async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.User).offset(skip).limit(limit))
    return result.scalars().all()

async def get_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(models.User).where(models.User.user_id == user_id))
    return result.scalars().first()

async def update_user(db: AsyncSession, user_id: int, user_data: dict):
    if "password" in user_data:
        user_data["hashed_password"] = hash_password(user_data.pop("password"))
    await db.execute(update(models.User).where(models.User.user_id == user_id).values(**user_data))
    await db.commit()
    return await get_user(db, user_id)

async def delete_user(db: AsyncSession, user_id: int):
    db_user = await get_user(db, user_id)

    if db_user:
        # Delete refresh tokens first
        await db.execute(delete(models.RefreshToken).where(models.RefreshToken.user_id == user_id))
        # Delete user
        await db.execute(delete(models.User).where(models.User.user_id == user_id))
        await db.commit()
    return db_user
