from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.models.post import Post
from backend.app.models.post_image import PostImage


class PostRepository:
    def __init__(self, db:AsyncSession):
        self.db = db

    async def create_post(
            self,
            content: str | None,
            is_published: bool = True,
            images_data: list[dict] | None = None,
    ) -> Post:
        post = Post(
            content=content,
            is_published=is_published,
        )

        if images_data:
            for image_data in images_data:
                post.images.append(PostImage(**image_data))

        self.db.add(post)
        await self.db.commit()
        await self.db.refresh(post)

        return post

    async def get_posts(self, only_published: bool = True) -> list[Post]:
        query = select(Post).options(selectinload(Post.images)).order_by(Post.created_at.desc())

        if only_published:
            query = query.where(Post.is_published.is_(True))

        result = await self.db.execute(query)
        return list(result.scalars().all())