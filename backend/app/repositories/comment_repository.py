from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.comment import Comment


class CommentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, comment: Comment) -> Comment:
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def get_by_id(self, comment_id: int):
        query = (
            select(Comment)
            .options(selectinload(Comment.author))
            .where(Comment.id == comment_id)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_post_id(self, post_id: int) -> list[Comment]:
        query = (
            select(Comment)
            .options(selectinload(Comment.author))
            .where(Comment.post_id == post_id)
            .order_by(Comment.created_at.asc())
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update(self, comment: Comment) -> Comment:
        await self.db.commit()
        return await self.get_by_id(comment.id)

    async def delete(self, comment: Comment) -> None:
        await self.db.delete(comment)
        await self.db.commit()