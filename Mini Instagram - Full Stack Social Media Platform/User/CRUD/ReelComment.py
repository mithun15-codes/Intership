from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

import models


async def create_reel_comment(db: AsyncSession, comment_data: dict):
    db_comment = models.ReelComment(**comment_data)
    db.add(db_comment)
    await db.commit()
    await db.refresh(db_comment)
    return db_comment

async def get_reel_comments(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.ReelComment).offset(skip).limit(limit))
    return result.scalars().all()

async def get_reel_comment(db: AsyncSession, comment_id: int):
    result = await db.execute(select(models.ReelComment).where(models.ReelComment.comment_id == comment_id))
    return result.scalars().first()

async def get_comments_by_reel(db: AsyncSession, reel_id: int, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.ReelComment).where(models.ReelComment.reel_id == reel_id).offset(skip).limit(limit))
    return result.scalars().all()

async def update_reel_comment(db: AsyncSession, comment_id: int, comment_data: dict):
    await db.execute(update(models.ReelComment).where(models.ReelComment.comment_id == comment_id).values(**comment_data))
    await db.commit()
    return await get_reel_comment(db, comment_id)

async def delete_reel_comment(db: AsyncSession, comment_id: int):
    db_comment = await get_reel_comment(db, comment_id)
    if db_comment:
        await db.execute(delete(models.ReelComment).where(models.ReelComment.comment_id == comment_id))
        await db.commit()
    return db_comment
