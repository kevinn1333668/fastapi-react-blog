from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from backend.app.core.security import create_access_token
from backend.app.schemas.auth import TokenResponse
from backend.app.core.config import settings
from backend.app.dependencies.auth import get_user
from backend.app.schemas.user import UserResponse

from typing import Annotated
from dotenv import load_dotenv


load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])



async def _authenticate_user(
        username: str,
        password: str,
):
    if username != settings.ADMIN_USERNAME or password != settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return username


@router.post("/login/", response_model=TokenResponse,status_code=status.HTTP_200_OK)
async def login_user(
        response: Response,
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    username = await _authenticate_user(form_data.username, form_data.password)
    access_token = create_access_token(username=username)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse,status_code=status.HTTP_200_OK)
async def get_me(
        current_user: Annotated[UserResponse, Depends(get_user)],
):
    return current_user