from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from backend.app.core.security import create_access_token
from backend.app.schemas.auth import TokenResponse, AuthResponse
from backend.app.core.config import settings
from backend.app.dependencies.auth import get_auth_service, get_current_user
from backend.app.schemas.user import UserResponse, CreateUser

from typing import Annotated
from dotenv import load_dotenv

from backend.app.services.auth_service import AuthService

load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register/",
    status_code=status.HTTP_201_CREATED,
    response_model=UserResponse,
)
@router.post(
    "/register/",
    status_code=status.HTTP_201_CREATED,
    response_model=AuthResponse,
)
async def register(
        data: CreateUser,
        auth_service: Annotated[AuthService, Depends(get_auth_service)],
):
    user = await auth_service.register(data)

    access_token = create_access_token(
        user_id=user.id,
        username=user.username,
        is_admin=user.is_admin,
    )

    return {
        "user": user,
        "access_token": access_token,
        "is_admin": user.is_admin,
        "token_type": "bearer"
    }


@router.post(
    "/login/",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK
)
async def login_user(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
        auth_service: Annotated[AuthService, Depends(get_auth_service)],
):
    user = await auth_service.authenticate_user(
        username=form_data.username,
        password=form_data.password
    )
    access_token = create_access_token(
        user_id=user.id,
        username=user.username,
        is_admin=user.is_admin,
    )

    return {
        "user": user,
        "access_token": access_token,
        "is_admin": user.is_admin,
        "token_type": "bearer"
    }



@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_me(
    current_user=Depends(get_current_user),
):
    return current_user