from datetime import datetime

from sqlalchemy import Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.core.db import Base
from backend.app.utils.time_utils import utcnow

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from backend.app.models.post_image import PostImage


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)

    is_published: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        onupdate=utcnow(),
    )

    images: Mapped[list["PostImage"]] = relationship(
        "PostImage",
        back_populates="post",
        cascade="all, delete, delete-orphan",
    )