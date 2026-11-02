from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete

import models

async def create_saved_reel(db: AsyncSession, saved_data: dict):
    db_saved = models.SavedReel(**saved_data)
    db.add(db_saved)
    await db.commit()
    await db.refresh(db_saved)
    return db_saved

async def get_saved_reels(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.SavedReel).offset(skip).limit(limit))
    return result.scalars().all()

async def get_saved_reel(db: AsyncSession, saved_reel_id: int):
    result = await db.execute(select(models.SavedReel).where(models.SavedReel.saved_reel_id == saved_reel_id))
    return result.scalars().first()

async def delete_saved_reel(db: AsyncSession, saved_reel_id: int):
    db_saved = await get_saved_reel(db, saved_reel_id)
    if db_saved:
        await db.execute(delete(models.SavedReel).where(models.SavedReel.saved_reel_id == saved_reel_id))
        await db.commit()
    return db_saved
