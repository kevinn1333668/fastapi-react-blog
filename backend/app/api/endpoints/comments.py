from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.models.user import User
from backend.app.schemas.comment import CommentResponse, CommentCreate, CommentUpdate
from backend.app.services.comment_service import CommentService
from backend.app.dependencies.auth import get_current_user
from backend.app.dependencies.comments import get_comment_service

router = APIRouter(tags=["comments"])


@router.get(
    '/posts/{post_id}/comments',
    response_model=list[CommentResponse]
)
async def get_comments(
        post_id: int,
        service: Annotated[CommentService, Depends(get_comment_service)],
        current_user: User = Depends(get_current_user),
):
    return await service.get_post_comments(post_id)

@router.post(
    "/posts/{post_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_comment(
        post_id: int,
        data: CommentCreate,
        service: Annotated[CommentService, Depends(get_comment_service)],
        current_user: Annotated[User, Depends(get_current_user)],
):
    return await service.create_comment(post_id, current_user.id, data)

@router.patch(
    "/comments/{comment_id}",
    response_model=CommentResponse,
    status_code=status.HTTP_200_OK,
)
async def update_comment(
        comment_id: int,
        data: CommentUpdate,
        service: Annotated[CommentService, Depends(get_comment_service)],
        current_user: Annotated[User, Depends(get_current_user)],
):
    return await service.update_comment(comment_id, current_user, data)

@router.delete(
    "/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_comment(
        comment_id: int,
        service: Annotated[CommentService, Depends(get_comment_service)],
        current_user: Annotated[User, Depends(get_current_user)],
):
    return await service.delete_comment(comment_id, current_user)