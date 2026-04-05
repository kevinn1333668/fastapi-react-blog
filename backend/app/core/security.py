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
oath2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login/")



def create_access_token(username: str, expires_delta: timedelta = timedelta(minutes=30)):
    expires = datetime.now() + expires_delta
    encode = {"sub": username, "type": "access", "exp": int(expires.timestamp())}
    return jwt.encode(encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate user"
        )


def get_user_from_token(token: Annotated[str, Depends(oath2_scheme)]) -> UserResponse:
    try:
        payload = decode_token(token)
        username: str = payload["sub"]
        expire: int = payload["exp"]

        if username is None or username != settings.ADMIN_USERNAME:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username",
            )

        return UserResponse(username=username)

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate user"
        )