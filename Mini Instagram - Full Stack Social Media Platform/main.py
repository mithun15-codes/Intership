from fastapi import FastAPI

from User.Routers.auth import router as auth_router
from User.Routers.user_r import router as user_router
from User.Routers.media_r import router as media_router
from User.Routers.follower_r import router as follower_router
from User.Routers.post_r import router as post_router
from User.Routers.post_like_r import router as post_like_router
from User.Routers.post_comment_r import router as post_comment_router
from User.Routers.saved_post_r import router as saved_post_router
from User.Routers.reel_r import router as reel_router
from User.Routers.reel_likes_r import router as reel_likes_router
from User.Routers.reel_comment_r import router as reel_comment_router
from User.Routers.saved_reel_r import router as saved_reel_router
from User.Routers.story_r import router as story_router
from Database.mongo import ping_mongo
from contextlib import asynccontextmanager
from Minio.config import init_minio

@asynccontextmanager
async def lifespan(app: FastAPI):
    await ping_mongo()
    init_minio()
    yield

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Mini Instagram", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:8000", "http://localhost:8000", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Auth
app.include_router(auth_router)

#User & Social
app.include_router(user_router)
app.include_router(follower_router)

#Posts
app.include_router(post_router)
app.include_router(post_like_router)
app.include_router(post_comment_router)
app.include_router(saved_post_router)

#Reels
app.include_router(reel_router)
app.include_router(reel_likes_router)
app.include_router(reel_comment_router)
app.include_router(saved_reel_router)

#Stories
app.include_router(story_router)

#Media
app.include_router(media_router)
