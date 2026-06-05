from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from backend.app.dependencies.db import get_db
from backend.app.repositories.quiz_repository import QuizRepository
from backend.app.services.quiz_service import QuizService


def get_quiz_service(
        db: Annotated[AsyncSession, Depends(get_db)]
):
    repository = QuizRepository(db)
    return QuizService(repository)