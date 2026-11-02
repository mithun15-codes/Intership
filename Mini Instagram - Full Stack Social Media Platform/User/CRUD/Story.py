from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from datetime import datetime

import models
import User.Schemas.Story as story_schema

async def create_story(
    db: AsyncSession,
    story: story_schema.StoryCreate,
    user_id: int,
    expires_at: datetime
):
    db_story = models.Story(
        **story.model_dump(),
        user_id=user_id,
        created_at=datetime.utcnow(),
        expires_at=expires_at
    )

    db.add(db_story)
    await db.commit()
    await db.refresh(db_story)
    return db_story

async def get_active_stories_by_user(db: AsyncSession, user_id: int):
    now = datetime.utcnow()
    result = await db.execute(
        select(models.Story)
        .where(models.Story.user_id == user_id)
        .where(models.Story.expires_at > now)
    )
    return result.scalars().all()

async def get_all_active_stories(db: AsyncSession):
    now = datetime.utcnow()
    result = await db.execute(
        select(models.Story)
        .where(models.Story.expires_at > now)
    )
    return result.scalars().all()

async def get_story(db: AsyncSession, story_id: int):
    result = await db.execute(select(models.Story).where(models.Story.story_id == story_id))
    return result.scalars().first()

async def delete_story(db: AsyncSession, story_id: int):
    db_story = await get_story(db, story_id)
    if db_story:
        await db.execute(delete(models.Story).where(models.Story.story_id == story_id))
        await db.commit()
    return db_story
