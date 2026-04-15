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

        query = (
            select(Post)
            .where(Post.id == post.id)
            .options(selectinload(Post.images))
        )
        result = await self.db.execute(query)

        return result.scalar_one()

    async def get_posts(self, only_published: bool = True) -> list[Post]:
        query = select(Post).options(selectinload(Post.images)).order_by(Post.created_at.desc())

        if only_published:
            query = query.where(Post.is_published.is_(True))

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_post_by_id(self, post_id: int) -> Post | None:
        query = (
            select(Post)
            .where(Post.id == post_id).
            options(selectinload(Post.images))
        )

        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def update_post(
            self,
            post: Post,
            content: str | None,
            is_published: bool | None = None,
    ) -> Post:
        if content is not None:
            post.content = content

        if is_published is not None:
            post.is_published = is_published

        await self.db.commit()
        await self.db.refresh(post)

        return post

    async def delete_post(self, post: Post) -> None:
        await self.db.delete(post)
        await self.db.commit()