from fastapi import Depends

from backend.app.services.file_service import FileService

def get_file_service() -> FileService:
    return FileService()