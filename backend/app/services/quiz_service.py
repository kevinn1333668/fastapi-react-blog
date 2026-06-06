import copy
from typing import Any

from fastapi import HTTPException, status

from backend.app.models.quiz import Quiz, QuizAttempt
from backend.app.repositories.quiz_repository import QuizRepository
from backend.app.schemas.quiz import QuizCreate, QuizUpdate, QuizSubmit, QuestionResult


class QuizService:
    def __init__(self, repo: QuizRepository):
        self.quiz_repository = repo

    async def create_quiz(self, data: QuizCreate) -> Quiz:
        quiz = Quiz(
            title=data.title,
            topic=data.topic,
            description=data.description,
            schema_json=data.quiz_schema,
            is_published=data.is_published,
        )
        return await self.quiz_repository.create_quiz(quiz)

    async def get_quiz_for_admin(self, quiz_id: int) -> Quiz:
        quiz = await self.quiz_repository.get_by_id(quiz_id)
        if not quiz:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
        return quiz

    async def get_quiz_for_user(self, quiz_id: int) -> dict:
        quiz = await self.quiz_repository.get_by_id(quiz_id)
        if not quiz:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

        clean_schema = self._strip_correct_answers(quiz.schema_json)

        return {
            "id": quiz.id,
            "title": quiz.title,
            "topic": quiz.topic,
            "description": quiz.description,
            "quiz_schema": clean_schema,
        }

    async def get_published_quizzes(self) -> list[Quiz]:
        return await self.quiz_repository.get_all_published()

    async def get_all_quizzes_admin(self) -> list[Quiz]:
        return await self.quiz_repository.get_all()

    async def update_quiz(self, quiz_id: int, data: QuizUpdate) -> Quiz:
        quiz = await self.quiz_repository.get_by_id(quiz_id)
        if not quiz:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

        if data.title is not None:
            quiz.title = data.title
        if data.topic is not None:
            quiz.topic = data.topic
        if data.description is not None:
            quiz.description = data.description
        if data.quiz_schema is not None:
            quiz.schema_json = data.quiz_schema
        if data.is_published is not None:
            quiz.is_published = data.is_published

        return await self.quiz_repository.update(quiz)

    async def delete_quiz(self, quiz_id: int) -> None:
        quiz = await self.quiz_repository.get_by_id(quiz_id)
        if not quiz:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
        await self.quiz_repository.delete(quiz)

    async def submit_answers(
            self,
            quiz_id: int,
            user_id: int,
            data: QuizSubmit
    ) -> dict:
        quiz = await self.quiz_repository.get_published_by_id(quiz_id)
        if not quiz:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

        results = self._check_answers(quiz.schema_json, data.answers)

        score = sum(1 for r in results if r["correct"])
        max_score = len(results)
        passed = score >= max_score * 0.7

        attempt = QuizAttempt(
            quiz_id=quiz_id,
            user_id=user_id,
            answers_json=data.answers,
            score=score,
            max_score=max_score,
            passed=passed
        )
        await self.quiz_repository.save_attempt(attempt)

        return {
            "score": score,
            "max_score": max_score,
            "passed": passed,
            "details": [
                QuestionResult(question=r["question"], correct=r["correct"])
                               for r in results
            ],
        }

    def _strip_correct_answers(self, schema: dict) -> dict:
        schema_copy = copy.deepcopy(schema)

        def remove_correct(obj):
            if isinstance(obj, dict):
                obj.pop("correctAnswer", None)
                for value in obj.values():
                    remove_correct(value)
            elif isinstance(obj, list):
                for item in obj:
                    remove_correct(item)

        remove_correct(schema_copy)
        return schema_copy

    def _check_answers(self, schema: dict, answers: dict) -> list[dict]:
        results = []

        questions = self._extract_questions(schema)

        for question in questions:
            name = question.get("name")
            correct_answer = question.get("correctAnswer")
            user_answer = answers.get(name)

            is_correct = self._compare_answers(correct_answer, user_answer)

            results.append({
                "question": name,
                "correct": is_correct,
            })

        return results

    def _extract_questions(self, schema: dict) -> list[dict]:
        questions = []

        pages = schema.get("pages", [])
        for page in pages:
            elements = page.get("elements", [])
            for element in elements:
                if "correctAnswer" in element:
                    questions.append(element)

        elements = schema.get("elements", [])
        for element in elements:
            if "correctAnswer" in element:
                questions.append(element)

        return questions

    def _compare_answers(self, correct: Any, user: Any) -> bool:
        if correct is None:
            return True

        if isinstance(correct, list) and isinstance(user, list):
            return correct == user

        return correct == user
