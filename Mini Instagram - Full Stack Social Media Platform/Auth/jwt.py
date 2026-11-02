from datetime import datetime, timedelta, timezone
from jose import jwt
from config import settings
import uuid

def create_access_token(user_id: int, role: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": str(user_id),
        "role": role,
        "type": "access",
        "exp": expire,
        "jti": str(uuid.uuid4())
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM)

def create_refresh_token(user_id: int, role: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
    payload = {
        "sub": str(user_id),
        "role": role,
        "type": "refresh",
        "exp": expire,
        "jti": str(uuid.uuid4())
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> dict:
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM]
    )
    if payload.get("type") != "access" and payload.get("type") is not None:
        raise ValueError("Invalid token type")
    return payload

def decode_refresh_token(token: str) -> dict:
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM]
    )
    if payload.get("type") != "refresh":
        raise ValueError("Invalid token type")
    return payload
