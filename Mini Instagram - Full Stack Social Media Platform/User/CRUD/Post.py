from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

import models

async def create_post(db: AsyncSession, post_data: dict):
    db_post = models.Post(**post_data)
    db.add(db_post)
    await db.commit()
    await db.refresh(db_post)
    return db_post

async def get_posts(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.Post).offset(skip).limit(limit))
    return result.scalars().all()

async def get_post(db: AsyncSession, post_id: int):
    result = await db.execute(select(models.Post).where(models.Post.post_id == post_id))
    return result.scalars().first()

async def update_post(db: AsyncSession, post_id: int, post_data: dict):
    await db.execute(update(models.Post).where(models.Post.post_id == post_id).values(**post_data))
    await db.commit()
    return await get_post(db, post_id)

async def delete_post(db: AsyncSession, post_id: int):
    # Delete child rows first to avoid FK constraint violations
    await db.execute(delete(models.PostLike).where(models.PostLike.post_id == post_id))
    await db.execute(delete(models.PostComment).where(models.PostComment.post_id == post_id))
    await db.execute(delete(models.SavedPost).where(models.SavedPost.post_id == post_id))
    await db.execute(delete(models.Post).where(models.Post.post_id == post_id))
    await db.commit()
