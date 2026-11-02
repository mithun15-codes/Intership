from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
from config import settings

uri = settings.MONGO_URI
client = AsyncIOMotorClient(
    uri,
    server_api=ServerApi('1'),
    serverSelectionTimeoutMS=5000,   # fail fast if cluster unreachable
    connectTimeoutMS=5000,           # fail fast on TCP connect
    socketTimeoutMS=10000,           # timeout on individual operations
)

db = client.Insta_db  # Insta_db is the DB
reel_likes_collection = db["Reel_Likes"]

async def ping_mongo():
    try:
        await client.admin.command("ping")
        print("MongoDB Connected successfully.")
    except Exception as e:
        # Log clearly but don't crash the server — MongoDB may be temporarily
        # unavailable (e.g. Atlas cluster paused, DNS issue, no internet).
        # Endpoints that use MongoDB will fail individually with their own errors.
        print(f"⚠️  MongoDB connection error (server will still start): {e}")
        print("    → Check: is your Atlas cluster active? Is your internet/DNS working?")
        print("    → Tip: MongoDB Atlas free-tier clusters pause after inactivity.")
