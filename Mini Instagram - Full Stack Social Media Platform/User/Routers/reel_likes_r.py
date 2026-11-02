from fastapi import APIRouter, Depends
from typing import List

from Auth.deps import get_current_user
from User.Schemas.Reel_likes import ReelLikeCreate, ReelLikeResponse
from User.CRUD.Reels_likes import create_reel_like, get_reel_likes_by_reel, collection
import models

router = APIRouter(
    prefix="/reel_likes",
    tags=["Reel Likes"],
)

# Toggles a like for a reel
@router.post("/toggle", response_model=dict)
async def toggle_reel_like_endpoint(
    reel_like: ReelLikeCreate,
    current_user: models.User = Depends(get_current_user),
):
    db_like = await collection.find_one({
        "reel_id": reel_like.reel_id,
        "user_id": current_user.user_id
    })
    if db_like:
        await collection.delete_one({
            "reel_id": reel_like.reel_id,
            "user_id": current_user.user_id
        })
        return {"status": "unliked"}
    else:
        like_data = {"reel_id": reel_like.reel_id, "user_id": current_user.user_id}
        await create_reel_like(like_data)
        return {"status": "liked"}

# Retrieves all likes for a specific reel
@router.get("/reel/{reel_id}", response_model=List[ReelLikeResponse])
async def read_likes_for_reel(reel_id: int):
    return await get_reel_likes_by_reel(reel_id)
