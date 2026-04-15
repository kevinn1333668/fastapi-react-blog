from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.dependencies.db import get_db
from backend.app.repositories.post_repository import PostRepository
from backend.app.services.post_service import PostService

from typing import Annotated


def get_post_service(db : Annotated[AsyncSession, Depends(get_db)]) -> PostService:
    repo = PostRepository(db)
    return PostService(repo)