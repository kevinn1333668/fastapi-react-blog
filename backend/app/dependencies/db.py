from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.db import async_session_maker
from typing import AsyncGenerator


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session