import os

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from typing import Annotated
from passlib.context import CryptContext
from dotenv import load_dotenv
from datetime import datetime, timedelta
from jose import jwt, JWTError

from backend.app.schemas.user import UserResponse
from backend.app.core.config import settings


bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login/")


def hash_password(password: str) -> str:
    return bcrypt_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt_context.verify(plain_password, hashed_password)


def create_access_token(
        user_id: int,
        username: str,
        is_admin: bool,
        expires_delta: timedelta = timedelta(minutes=30)
) -> str:
    expires = datetime.now() + expires_delta
    payload = {
        "sub": str(user_id),
        "username": username,
        "is_admin": is_admin,
        "type": "access",
        "exp": int(expires.timestamp())}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate user",
            headers={"WWW-Authenticate": "Bearer"},
        )

