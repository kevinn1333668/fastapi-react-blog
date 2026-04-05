from typing import Annotated
from fastapi import Depends
from backend.app.core.security import get_user_from_token
from backend.app.schemas.user import UserResponse


def get_user(user: Annotated[UserResponse, Depends(get_user_from_token)]) -> UserResponse:
    return user