from datetime import datetime, timezone
from fastapi import HTTPException
from Database.mongo import reel_likes_collection

collection = reel_likes_collection

async def create_reel_like(payload_data: dict) -> dict:
    last_like = await collection.find_one(
        sort=[("like_id", -1)]
    )

    next_like_id = (
        last_like["like_id"] + 1
        if last_like else 1
    )

    doc = {
        "user_id": payload_data["user_id"],
        "reel_id": payload_data["reel_id"],
        "like_id": next_like_id,
        "created_at": datetime.now(timezone.utc),
    }

    await collection.insert_one(doc)

    return doc

async def get_all_reel_likes() -> list:
    likes = []
    async for like in collection.find({}, {"_id": 0}):
        likes.append(like)
    return likes

async def get_reel_like(like_id: int) -> dict:
    like = await collection.find_one({"like_id": like_id}, {"_id": 0})
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")
    return like

async def get_reel_likes_by_reel(reel_id: int) -> list:
    likes = []
    async for like in collection.find({"reel_id": reel_id}, {"_id": 0}):
        likes.append(like)
    return likes

async def delete_reel_like(like_id: int) -> dict:
    result = await collection.delete_one({"like_id": like_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Like not found")
    return {"message": "Like deleted successfully"}
