from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.quiz import Quiz, QuizAttempt


class QuizRepository:
    def __init__(self, db: AsyncSession):
        self.db = db


    async def create_quiz(self, quiz: Quiz) -> Quiz:
        self.db.add(quiz)
        await self.db.commit()
        await self.db.refresh(quiz)
        return quiz

    async def get_by_id(self, quiz_id: int) -> Quiz:
        query = select(Quiz).where(Quiz.id == quiz_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_published_by_id(self, quiz_id: int) -> Quiz:
        query = select(Quiz).where(Quiz.id == quiz_id, Quiz.is_published == True)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_all(self) -> list[Quiz]:
        query = select(Quiz).order_by(Quiz.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_all_published(self):
        query = (select(Quiz)
                 .where(Quiz.is_published == True)
                 .order_by(Quiz.created_at.desc())
                 )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update(self, quiz: Quiz) -> Quiz:
        await self.db.commit()
        await self.db.refresh(quiz)
        return quiz

    async def delete(self, quiz: Quiz):
        await self.db.delete(quiz)
        await self.db.commit()

    async def save_attempt(self, attempt: QuizAttempt) -> QuizAttempt:
        self.db.add(attempt)
        await self.db.commit()
        await self.db.refresh(attempt)
        return attempt