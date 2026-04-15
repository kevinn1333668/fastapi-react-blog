from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.endpoints import auth
from backend.app.api.endpoints import posts
from backend.app.api.endpoints import admin_posts

app = FastAPI(
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]

)

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(admin_posts.router)