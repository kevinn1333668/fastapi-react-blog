from datetime import datetime
from pydantic import BaseModel, ConfigDict


class PostImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    file_url: str
    sort_order: int


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str | None
    is_published: bool
    created_at: datetime
    updated_at: datetime | None
    images: list[PostImageResponse]


class PostUpdateRequest(BaseModel):
    content: str | None
    is_published: bool | None = None
    image_urls: list[str] | None = None


class CreatePostRequest(BaseModel):
    content: str | None = None
    image_urls: list[str] = []
    is_published: bool = True


class PostListRespone(BaseModel):
    items: list[PostResponse]
    limit: int
    offset: int
    total: int