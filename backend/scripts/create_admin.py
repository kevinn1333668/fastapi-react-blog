import asyncio
import sys

from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from backend.app.core.config import settings
from backend.app.core.db import Base
from backend.app.models.user import User

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def create_admin(username: str, password: str):
    engine = create_async_engine(settings.get_db_url)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with session_factory() as session:
        user = User(
            username=username,
            hashed_password=bcrypt_context.hash(password),
            is_active=True,
            is_admin=True,
        )
        session.add(user)
        await session.commit()
        print(f"Admin '{username}' created successfully!")

    await engine.dispose()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python -m scripts.create_admin <username> <password>")
        sys.exit(1)

    asyncio.run(create_admin(sys.argv[1], sys.argv[2]))