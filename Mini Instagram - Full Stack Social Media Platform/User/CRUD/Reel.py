from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

import models


async def create_reel(db: AsyncSession, reel_data: dict):
    db_reel = models.Reel(**reel_data)
    db.add(db_reel)
    await db.commit()
    await db.refresh(db_reel)
    return db_reel

async def get_reels(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.Reel).offset(skip).limit(limit))
    return result.scalars().all()

async def get_reel(db: AsyncSession, reel_id: int):
    result = await db.execute(select(models.Reel).where(models.Reel.reel_id == reel_id))
    return result.scalars().first()

async def update_reel(db: AsyncSession, reel_id: int, reel_data: dict):
    await db.execute(update(models.Reel).where(models.Reel.reel_id == reel_id).values(**reel_data))
    await db.commit()
    return await get_reel(db, reel_id)

async def delete_reel(db: AsyncSession, reel_id: int):
    # Delete child rows first to avoid FK constraint violations
    await db.execute(delete(models.ReelComment).where(models.ReelComment.reel_id == reel_id))
    await db.execute(delete(models.SavedReel).where(models.SavedReel.reel_id == reel_id))
    await db.execute(delete(models.Reel).where(models.Reel.reel_id == reel_id))
    await db.commit()
