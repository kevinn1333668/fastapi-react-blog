from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Query

from backend.app.schemas.post import PostResponse, PostListResponse
from backend.app.services.post_service import PostService
from backend.app.dependencies.post import get_post_service


router = APIRouter(tags=["posts"])
admin_router = APIRouter(prefix="/admin/posts", tags=["admin-posts"])


@router.get("/posts", response_model=PostListResponse)
async def get_posts(
        service: Annotated[PostService, Depends(get_post_service)],
        limit: int = Query(10, ge=1, le=50),
        offset: int = Query(0, ge=0),
):
    return await service.get_posts(
        limit=limit,
        offset=offset,
    )


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

