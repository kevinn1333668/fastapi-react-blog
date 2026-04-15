from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.schemas.post import PostResponse
from backend.app.services.post_service import PostService
from backend.app.dependencies.post import get_post_service


router = APIRouter(tags=["posts"])
admin_router = APIRouter(prefix="/admin/posts", tags=["admin-posts"])


@router.get("/posts", response_model=list[PostResponse])
async def get_posts(
        service: Annotated[PostService, Depends(get_post_service)],
):
    return await service.get_posts()


@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(
        post_id: int,
        service: Annotated[PostService, Depends(get_post_service)],
):
    try:
        return await service.get_post_by_id(post_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

