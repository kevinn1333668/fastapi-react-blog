from fastapi import HTTPException, status

from backend.app.models.comment import Comment
from backend.app.models.user import User
from backend.app.repositories.comment_repository import CommentRepository
from backend.app.schemas.comment import CommentCreate, CommentUpdate


class CommentService:
    def __init__(self, comment_repository: CommentRepository):
        self.comment_repository = comment_repository

    async def create_comment(
            self,
            post_id: int,
            user_id: int,
            data: CommentCreate,
    ) -> Comment:
        comment = Comment(
            content=data.content,
            post_id=post_id,
            user_id=user_id,
        )
        return await self.comment_repository.create(comment)

    async def get_post_comments(self, post_id: int) -> list[Comment]:
        comments = await self.comment_repository.get_by_post_id(post_id)
        if not comments:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        return comments

    async def update_comment(
            self,
            comment_id: int,
            user: User,
            data: CommentUpdate,
    ) -> Comment:
        comment = await self.comment_repository.get_by_id(comment_id)

        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

        if comment.user_id != user.id and not user.is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

        comment.content = data.content
        return await self.comment_repository.update(comment)

    async def delete_comment(
            self,
            comment_id: int,
            user: User
    ):
        comment = await self.comment_repository.get_by_id(comment_id)
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

        if comment.user_id != user.id and not user.is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

        await self.comment_repository.delete(comment)