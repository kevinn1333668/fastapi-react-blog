from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Any


class QuizCreate(BaseModel):
    title: str = Field(max_length=200)
    topic: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=200)
    quiz_schema: dict[str, Any] = Field(alias="schema_json")
    is_published: bool | None = False


class QuizUpdate(BaseModel):
    title: str = Field(max_length=200)
    topic: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=200)
    quiz_schema: dict[str, Any] = Field(alias="schema_json")
    is_published: bool | None = False


class  QuizListItem(BaseModel):
    id: int
    title: str
    topic: str | None
    description: str | None

    model_config = ConfigDict(from_attributes=True)


class QuizPublicResponse(BaseModel):
    id: int
    title: str
    topic: str | None
    description: str | None
    quiz_schema: dict[str, Any]


    model_config = ConfigDict(from_attributes=True)


class QuizAdminResponse(BaseModel):
    id: int
    title: str
    topic: str | None
    description: str | None
    quiz_schema: dict[str, Any] = Field(alias="schema_json")
    is_published: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuizSubmit(BaseModel):
    answers: dict[str, Any]


class QuestionResult(BaseModel):
    question: str
    correct: bool


class QuizSubmitResponse(BaseModel):
    score: int
    max_score: int
    passed: bool
    details: list[QuestionResult]