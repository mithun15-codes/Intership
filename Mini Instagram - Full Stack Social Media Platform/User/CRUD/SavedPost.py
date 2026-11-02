from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete

import models

async def create_saved_post(db: AsyncSession, saved_data: dict):
    db_saved = models.SavedPost(**saved_data)
    db.add(db_saved)
    await db.commit()
    await db.refresh(db_saved)
    return db_saved

async def get_saved_posts(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.SavedPost).offset(skip).limit(limit))
    return result.scalars().all()

async def get_saved_post(db: AsyncSession, saved_post_id: int):
    result = await db.execute(select(models.SavedPost).where(models.SavedPost.saved_post_id == saved_post_id))
    return result.scalars().first()

async def delete_saved_post(db: AsyncSession, saved_post_id: int):
    db_saved = await get_saved_post(db, saved_post_id)
    if db_saved:
        await db.execute(delete(models.SavedPost).where(models.SavedPost.saved_post_id == saved_post_id))
        await db.commit()
    return db_saved
