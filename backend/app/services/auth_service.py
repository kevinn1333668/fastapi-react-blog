from fastapi import HTTPException, status
from backend.app.repositories.user_repository import UserRepository
from backend.app.schemas.user import CreateUser
from backend.app.models.user import User
from backend.app.core.security import hash_password, verify_password


class AuthService:
    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repository = user_repository

    async def register(self, data: CreateUser) -> User:
        existing_user = await self.user_repository.get_by_username(data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with that username already exists"
            )

        user = User(
            username=data.username,
            #email=data.email,
            hashed_password=hash_password(data.password),
        )

        return await self.user_repository.create(user)

    async def authenticate_user(self, username: str, password: str) -> User:
        user = await self.user_repository.get_by_username(username)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"}
            )

        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"}
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is inactive",
            )

        return user

    async def get_user_by_id(self, user_id: int) -> User | None:
        return await self.user_repository.get_by_id(user_id)