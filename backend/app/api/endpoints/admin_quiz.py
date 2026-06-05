from typing import Annotated
from fastapi import APIRouter, Depends, status

from backend.app.schemas.quiz import (
    QuizCreate,
    QuizUpdate,
    QuizAdminResponse
)
from backend.app.services.quiz_service import QuizService
from backend.app.dependencies.quiz import get_quiz_service
from backend.app.dependencies.auth import get_current_admin_user


router = APIRouter(
    prefix="/admin/quizzes",
    tags=["admin-quizzes"],
    dependencies=[Depends(get_current_admin_user)]
)


@router.get("", response_model=list[QuizAdminResponse])
async def get_all_quizzes(
        service: Annotated[QuizService, Depends(get_quiz_service)],
):
    return await service.get_all_quizzes_admin()

@router.post("/{quiz_id}", response_model=QuizAdminResponse)
async def get_quiz_admin(
        quiz_id: int,
        service: Annotated[QuizService, Depends(get_quiz_service)],
):
    return await service.get_quiz_for_admin(quiz_id)

@router.post(
    "",
    response_model=QuizAdminResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_quiz(
        data: QuizCreate,
        service: Annotated[QuizService, Depends(get_quiz_service)],
):
    return await service.create_quiz(data)

@router.patch("/{quiz_id}", response_model=QuizAdminResponse)
async def update_quiz(
        quiz_id: int,
        data: QuizUpdate,
        services: Annotated[QuizService, Depends(get_quiz_service)],
):
    return await services.update_quiz(quiz_id, data)

@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(
        quiz_id: int,
        service: Annotated[QuizService, Depends(get_quiz_service)],
):
    await service.delete_quiz(quiz_id)