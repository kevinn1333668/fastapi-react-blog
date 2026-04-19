import asyncio

from backend.app.core.db import async_session_maker
from backend.app.repositories.post_repository import PostRepository
from backend.app.services.file_cleanup_service import FileCleanupService


async def main() -> None:
    async with async_session_maker() as db:
        repo = PostRepository(db)
        service = FileCleanupService(repo)

        deleted_files = await service.cleanup_orphan_images()

        print("Deleted files: ")
        for path in deleted_files:
            print(path)

        print(f"Total deleted files: {len(deleted_files)}")


if __name__ == "__main__":
    asyncio.run(main())