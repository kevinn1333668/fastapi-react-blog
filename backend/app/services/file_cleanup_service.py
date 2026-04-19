from pathlib import Path

from backend.app.repositories.post_repository import PostRepository


class FileCleanupService:
    def __init__(self, repo: PostRepository):
        self.repo = repo
        self.media_dir = Path("backend/media/posts")

    async def cleanup_orphan_images(self) -> list[str]:
        used_urls = await self.repo.get_all_image_urls()

        used_filenames = set()

        for url in used_urls:
            filename = Path(url).name
            used_filenames.add(filename)

        deleted_files: list[str] = []

        if not self.media_dir.exists():
            return deleted_files

        for file_path in self.media_dir.iterdir():
            if not file_path.is_file():
                continue

            if file_path.name not in used_filenames:
                file_path.unlink()
                deleted_files.append(str(file_path))

        return deleted_files

