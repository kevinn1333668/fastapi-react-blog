from typing import List

from backend.app.models.post import Post
from backend.app.repositories.post_repository import PostRepository


class PostService:
    def __init__(self, repo: PostRepository):
        self.repo = repo

    async def create_post(
            self,
            content: str | None,
            image_urls: List[str] | None = None,
    ) -> Post:
        if not content and not image_urls:
            raise ValueError("Post contain text or images")

        images_data = []

        if image_urls:
            for i, url in enumerate(image_urls):
                images_data.append({
                    "file_url": url,
                    "sort_order": i,
                })

        return await self.repo.create_post(
            content=content,
            images_data=images_data
        )

    async def get_posts(self) -> list[Post]:
        return await self.repo.get_posts()

    async def get_post_by_id(self, post_id: int) -> Post:
        post = await self.repo.get_post_by_id(post_id)

        if not post:
            raise ValueError("Post not found")

        return post

    async def update_post(
            self,
            post_id: int,
            content: str | None,
    ) -> Post:
        post = await self.repo.get_post_by_id(post_id)

        if not post:
            raise ValueError("Post not found")

        return await self.repo.update_post(
            post=post,
            content=content
        )

    async def delete_post(self, post_id: int) -> None:
        post = await self.repo.get_post_by_id(post_id)

        if not post:
            raise ValueError("Post not found")

        await self.repo.delete_post(post)