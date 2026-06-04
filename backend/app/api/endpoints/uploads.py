from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile

from backend.app.dependencies.auth import get_current_user
from backend.app.schemas.user import UserResponse
from backend.app.dependencies.file import get_file_service
from backend.app.services.file_service import FileService

router = APIRouter(prefix="/admin/uploads", tags=["admin-uploads"])


@router.post("/image")
async def upload_image(
        current_user: Annotated[UserResponse, Depends(get_current_user)],
        file_service: Annotated[FileService, Depends(get_file_service)],
        file: Annotated[UploadFile, File(...)],
):
    file_url = await file_service.save_image(file)

    return {"file_url": file_url}