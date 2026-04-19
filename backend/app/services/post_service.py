from operator import index
from typing import List

from backend.app.models.post import Post
from backend.app.repositories.post_repository import PostRepository
from backend.app.services.file_service import FileService


class PostService:
    def __init__(self, repo: PostRepository):
        self.repo = repo

    async def create_post(
            self,
            content: str | None,
            image_urls: List[str] | None = None,
            is_published: bool = True
    ) -> Post:
        if not content and not image_urls:
            raise ValueError("Post contain text or images")

        images_data = []

        if image_urls:
            for index, file_url in enumerate(image_urls):
                images_data.append({
                    "file_url": file_url,
                    "sort_order": index,
                })

        return await self.repo.create_post(
            content=content,
            is_published=is_published,
            images_data=images_data
        )

    async def get_posts(
            self,
            limit: int = 10,
            offset: int = 0,
    ) -> dict:
        limit = min(max(limit, 1), 100)
        offset = max(offset, 0)

        items, total = await self.repo.get_posts(limit=limit, offset=offset)

        return {
            "items": items,
            "limit": limit,
            "offset": offset,
            "total": total,
        }
    async def get_post_by_id(self, post_id: int) -> Post:
        post = await self.repo.get_post_by_id(post_id)

        if not post:
            raise ValueError("Post not found")

        return post

    async def update_post(
            self,
            post_id: int,
            content: str | None,
            is_published: bool | None = None,
            image_urls: list[str] | None = None
    ) -> Post:
        post = await self.repo.get_post_by_id(post_id)

        if not post:
            raise ValueError("Post not found")

        final_content = content if content is not None else post.content
        final_image_urls = image_urls if image_urls is not None else [img.file_url for img in post.images]

        if not final_content and not final_image_urls:
            raise ValueError("Post must contain text or images")

        images_data = None

        if image_urls is not None:
            images_data = [
                {
                    "file_url": file_url,
                    "sort_order": index,
                }
                for index, file_url in enumerate(image_urls)
            ]

        return await self.repo.update_post(
            post=post,
            content=content,
            is_published=is_published,
            images_data=images_data
        )

    async def delete_post(self, post_id: int) -> None:
        post = await self.repo.get_post_by_id(post_id)

        if not post:
            raise ValueError("Post not found")

        file_service = FileService()

        for image in post.images:
            file_service.delete_image(image.file_url)

        await self.repo.delete_post(post)