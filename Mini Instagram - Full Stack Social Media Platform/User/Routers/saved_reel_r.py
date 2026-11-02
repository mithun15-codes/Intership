from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy.future import select
from sqlalchemy import delete

from Database.post import get_db
from Auth.deps import get_current_user
from User.Schemas.SavedReel import SavedReelCreate, SavedReel
from User.CRUD.SavedReel import create_saved_reel
import models

router = APIRouter(
    prefix="/saved_reels",
    tags=["Saved Reels"],
)

# Toggles a saved reel
@router.post("/toggle", response_model=dict)
async def toggle_saved_reel_endpoint(
    saved_reel: SavedReelCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    result = await db.execute(
        select(models.SavedReel)
        .where(models.SavedReel.reel_id == saved_reel.reel_id, models.SavedReel.user_id == current_user.user_id)
    )
    db_save = result.scalars().first()
    if db_save:
        await db.execute(delete(models.SavedReel).where(models.SavedReel.saved_reel_id == db_save.saved_reel_id))
        await db.commit()
        return {"status": "unsaved"}
    else:
        save_data = {"reel_id": saved_reel.reel_id, "user_id": current_user.user_id}
        await create_saved_reel(db, save_data)
        return {"status": "saved"}

# Retrieves all saved records for a specific reel
@router.get("/reel/{reel_id}", response_model=List[SavedReel])
async def read_saved_for_reel(reel_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SavedReel).where(models.SavedReel.reel_id == reel_id))
    return result.scalars().all()
