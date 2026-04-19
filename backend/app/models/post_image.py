from sqlalchemy import ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.core.db import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from backend.app.models.post import Post


class PostImage(Base):
    __tablename__ = "post_images"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    file_url: Mapped[str] = mapped_column(String, nullable=False)

    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)

    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
    )

    post: Mapped["Post"] = relationship(
        "Post",
        back_populates="images",
    )