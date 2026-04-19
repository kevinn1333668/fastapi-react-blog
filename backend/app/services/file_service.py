from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from starlette import status

from backend.app.core.security import settings

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webq"
}

class FileService:
    async def save_image(self, file: UploadFile) -> str:
        if not file.content_type or file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type"
            )

        suffix = Path(file.filename).suffix if file.filename else ".jpeg"
        filename = f"{uuid4()}{suffix}"
        file_path = UPLOAD_DIR / filename

        content = await file.read()

        with open(file_path, "wb") as buffer:
            buffer.write(content)

        return f"/media/posts/{filename}"

    def delete_image(self, file_url: str) -> None:
        if not file_url:
            return

        media_prefix = "/media/"
        if media_prefix in file_url:
            relative_path = file_url.split(media_prefix, 1)[1]
            file_path = UPLOAD_DIR / relative_path

            if file_path.exists():
                file_path.unlink()

