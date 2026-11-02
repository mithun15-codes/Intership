from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete

import models

async def create_follower(db: AsyncSession, follower_data: dict):
    db_follower = models.Follower(**follower_data)
    db.add(db_follower)
    await db.commit()
    await db.refresh(db_follower)
    return db_follower

from typing import Optional

async def get_followers(
    db: AsyncSession,
    follower_id: Optional[int] = None,
    following_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 1000
):
    query = select(models.Follower)
    if follower_id is not None:
        query = query.where(models.Follower.follower_id == follower_id)
    if following_id is not None:
        query = query.where(models.Follower.following_id == following_id)
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

async def get_follower(db: AsyncSession, follower_id: int, following_id: int):
    result = await db.execute(
        select(models.Follower)
        .where(models.Follower.follower_id == follower_id, models.Follower.following_id == following_id)
    )
    return result.scalars().first()

async def delete_follower(db: AsyncSession, follower_id: int, following_id: int):
    db_follower = await get_follower(db, follower_id, following_id)
    if db_follower:
        await db.execute(
            delete(models.Follower).where(models.Follower.follower_id == follower_id, models.Follower.following_id == following_id))
        await db.commit()
    return db_follower
