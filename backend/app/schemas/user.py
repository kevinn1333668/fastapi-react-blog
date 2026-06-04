from pydantic import BaseModel, Field, ConfigDict


class CreateUser(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    #email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=3, max_length=255)

class UserResponse(BaseModel):
    id: int
    username: str
    is_admin: bool

    model_config = ConfigDict(from_attributes=True)