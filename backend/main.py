from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.api.endpoints import auth
from backend.app.api.endpoints import posts
from backend.app.api.endpoints import admin_posts
from backend.app.api.endpoints import uploads
from backend.app.api.endpoints import comments
from backend.app.api.endpoints import quiz
from backend.app.api.endpoints import admin_quiz

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

app.mount("/media", StaticFiles(directory="backend/media"), name="media")

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(admin_posts.router)
app.include_router(uploads.router)
app.include_router(comments.router)
app.include_router(quiz.router)
app.include_router(admin_quiz.router)