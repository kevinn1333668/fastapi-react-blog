from typing import Annotated
from fastapi import APIRouter, Depends

from backend.app.models.user import User
from backend.app.schemas.quiz import (
    QuizSubmit,
    QuizSubmitResponse,
    QuizPublicResponse, QuizListItem
)
from backend.app.services.quiz_service import QuizService
from backend.app.dependencies.quiz import get_quiz_service
from backend.app.dependencies.auth import get_current_user


router = APIRouter(
    prefix="/quizzes",
    tags=["quizzes"]
)


@router.get("", response_model=list[QuizListItem])
async def get_quizzes(
    service: Annotated[QuizService, Depends(get_quiz_service)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await service.get_published_quizzes()

@router.get("/{quiz_id}", response_model=QuizPublicResponse)
async def get_quiz(
        quiz_id: int,
        service: Annotated[QuizService, Depends(get_quiz_service)],
):
    return await service.get_quiz_for_user(quiz_id)

@router.post("/{quiz_id}/submit", response_model=QuizSubmitResponse)
async def submit_quiz(
        quiz_id: int,
        data: QuizSubmit,
        service: Annotated[QuizService, Depends(get_quiz_service)],
        current_user: Annotated[User, Depends(get_current_user)],
):
    return await service.submit_answers(
        quiz_id=quiz_id,
        user_id=current_user.id,
        data=data,
    )

