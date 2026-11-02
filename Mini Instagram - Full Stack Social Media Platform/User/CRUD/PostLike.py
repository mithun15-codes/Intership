from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete

import models

async def create_post_like(db: AsyncSession, like_data: dict):
    db_like = models.PostLike(**like_data)
    db.add(db_like)
    await db.commit()
    await db.refresh(db_like)
    return db_like

async def get_post_likes(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.PostLike).offset(skip).limit(limit))
    return result.scalars().all()

async def get_post_like(db: AsyncSession, like_id: int):
    result = await db.execute(select(models.PostLike).where(models.PostLike.like_id == like_id))
    return result.scalars().first()

async def delete_post_like(db: AsyncSession, like_id: int):
    db_like = await get_post_like(db, like_id)
    if db_like:
        await db.execute(delete(models.PostLike).where(models.PostLike.like_id == like_id))
        await db.commit()
    return db_like
