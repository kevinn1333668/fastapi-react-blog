from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.core.security import get_user_from_token
from backend.app.schemas.post import PostResponse, PostUpdateRequest
from backend.app.schemas.user import UserResponse
from backend.app.services.post_service import PostService
from backend.app.dependencies.post import get_post_service

router = APIRouter(prefix="/admin/posts", tags=["admin-posts"])


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
        content: str | None,
        service: Annotated[PostService, Depends(get_post_service)],
        current_user: Annotated[UserResponse, Depends(get_user_from_token)],
):
    try:
        return await service.create_post(content=content, image_urls=[])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.patch("/{post_id}", response_model=PostResponse, status_code=status.HTTP_200_OK)
async def update_post(
        post_id: int,
        data: PostUpdateRequest,
        service: Annotated[PostService, Depends(get_post_service)],
        current_user: Annotated[UserResponse, Depends(get_user_from_token)],
):
    try:
        return await service.update_post(post_id=post_id, content=data.content)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
        post_id: int,
        service: Annotated[PostService, Depends(get_post_service)],
        current_user: Annotated[UserResponse, Depends(get_user_from_token)],
):
    try:
        return await service.delete_post(post_id=post_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )