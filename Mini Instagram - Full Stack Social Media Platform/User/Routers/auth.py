from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import or_

from Database.post import get_db
import models
from User.Schemas.User import UserCreate
from Auth.password import hash_password, verify_password
from Auth.jwt import create_access_token, create_refresh_token, decode_refresh_token
from datetime import datetime, timedelta
from pydantic import BaseModel
from config import settings


router = APIRouter(prefix="/auth", tags=["Authentication"])

class RefreshTokenRequest(BaseModel):
    refresh_token: str

#For the registeration of new user
@router.post("/register")
async def register(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(models.User).where(models.User.email == payload.email))
    if result.scalars().first():
        raise HTTPException(status_code=400,detail="Email already exists")

    result = await db.execute(select(models.User).where(models.User.username == payload.username))
    if result.scalars().first():
        raise HTTPException(status_code=400,detail="Username already exists")

    result = await db.execute(
        select(models.Role).where(models.Role.role_id == payload.role_id))
    if not result.scalars().first():
        raise HTTPException(status_code=400,detail="Invalid role_id")

    created_at = payload.created_at
    if created_at and created_at.tzinfo:
        created_at = created_at.replace(tzinfo=None)
    elif not created_at:
        created_at = datetime.utcnow()

    user = models.User(
        username=payload.username,
        full_name=payload.full_name,
        email=payload.email,
        phone_no=payload.phone_no,
        hashed_password=hash_password(payload.password),
        dob=payload.dob,
        bio=payload.bio,
        role_id=payload.role_id,
        created_at=created_at,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return {"message": "Registered successfully", "user_id": user.user_id}


#For login
@router.post("/login")
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.User)
        .options(selectinload(models.User.role))
        .where(
            or_(
                models.User.username == form_data.username,
                models.User.email == form_data.username
            )
        )
    )
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=401,detail="Invalid email or password")

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401,detail="Invalid email or password")

    role_name = user.role.role_name if user.role else "user"
    token = create_access_token(user.user_id,role_name)
    refresh_token = create_refresh_token(user.user_id,role_name)

    expires_at = datetime.utcnow() + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    db_refresh_token = models.RefreshToken(
        user_id=user.user_id,
        token=refresh_token,
        expires_at=expires_at,
        created_at=datetime.utcnow(),
        revoked=False
    )
    db.add(db_refresh_token)
    await db.commit()

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    return {
        "access_token": token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "message": "Logged in successfully"
    }

#When a user's access token expires, they don't need to log in again instead they call:
@router.post("/refresh")
async def refresh(
    payload: RefreshTokenRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)):
    
    refresh_token = payload.refresh_token
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing from request")

    try:
        decoded_payload = decode_refresh_token(refresh_token)
        user_id_str = decoded_payload.get("sub")
        if not user_id_str:
            raise HTTPException(status_code=401, detail="Invalid refresh token format")
        user_id = int(user_id_str)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token signature")

    result = await db.execute(select(models.RefreshToken).where(models.RefreshToken.token == refresh_token))
    db_token = result.scalars().first()
    
    if not db_token or db_token.revoked or db_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Invalid, expired, or revoked refresh token")

    result = await db.execute(select(models.User).options(selectinload(models.User.role)).where(models.User.user_id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    db_token.revoked = True

    role_name = user.role.role_name if user.role else "user"
    new_access_token = create_access_token(user.user_id, role_name)
    new_refresh_token = create_refresh_token(user.user_id, role_name)

    new_expires_at = datetime.utcnow() + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    new_db_token = models.RefreshToken(
        user_id=user.user_id,
        token=new_refresh_token,
        expires_at=new_expires_at,
        created_at=datetime.utcnow(),
        revoked=False
    )
    db.add(new_db_token)
    await db.commit()

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "message": "Tokens refreshed successfully"
    }

#For logout
@router.post("/logout")
async def logout(
    payload: RefreshTokenRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)):
    
    refresh_token = payload.refresh_token
    
    if refresh_token:
        result = await db.execute(select(models.RefreshToken).where(models.RefreshToken.token == refresh_token))
        db_token = result.scalars().first()
        
        if db_token:
            db_token.revoked = True
            await db.commit()
            
    response.delete_cookie("access_token")
    
    return {"message": "Logged out successfully"}
