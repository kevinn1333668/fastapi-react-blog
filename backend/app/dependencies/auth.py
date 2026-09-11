import logging
from typing import Annotated
from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from backend.app.models.user import User
from backend.app.repositories.comment_repository import CommentRepository
from backend.app.schemas.user import UserResponse
from backend.app.services.auth_service import AuthService
from backend.app.repositories.user_repository import UserRepository
from backend.app.dependencies.db import get_db
from backend.app.core.security import decode_token, oauth2_scheme
from backend.app.services.comment_service import CommentService


def get_auth_service(db: Annotated[AsyncSession, Depends(get_db)]) -> AuthService:
    repo = UserRepository(db)
    return AuthService(repo)


def _decode_access_token(token: str) -> int:
    try:
        payload = decode_token(token)
    except Exception as e:
        logging.exception("WS token decode failed: %s", e)
        raise ValueError("invalid token") from e

    if payload.get("type") != "access":
        raise ValueError("invalid token type")

    user_id = payload.get("sub")
    if user_id is None:
        raise ValueError("invalid token payload")

    return int(user_id)



async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
):

    try:
        user_id = _decode_access_token(token)

    except ValueError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")

    user = await auth_service.get_user_by_id(int(user_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


async def get_current_admin_user(
        current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action",
        )
    return current_user

