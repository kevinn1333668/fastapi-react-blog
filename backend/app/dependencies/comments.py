from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession


from backend.app.repositories.comment_repository import CommentRepository
from backend.app.dependencies.db import get_db
from backend.app.services.comment_service import CommentService


def get_comment_service(db: Annotated[AsyncSession, Depends(get_db)]) -> CommentService:
    repo = CommentRepository(db)
    return CommentService(repo)