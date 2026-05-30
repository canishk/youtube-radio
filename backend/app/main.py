from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import os

from app.core.scheduler import start_scheduler
from app.db.database import engine, Base
from app.models.category import Category
from app.models.song import Song
from app.models.playback_history import PlaybackHistory
from app.models.session import Session
from app.models.video_health import VideoHealth

from app.db.session import SessionLocal
from app.services.seed_service import seed_categories
from app.services.song_seed_service import seed_songs

from app.api.category_routes import router as category_router
from app.api.song_routes import router as song_router
from app.api.video_routes import router as video_router
from app.api.session_routes import router as session_router



load_dotenv()

Base.metadata.create_all(bind=engine)

db = SessionLocal()
seed_categories(db)
seed_songs(db)
db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield

app = FastAPI(title=os.getenv("APP_NAME"), version=os.getenv("API_VERSION"), lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Utube Radio API!",
        "version": app.version,
        "environment": os.getenv("APP_ENV"),
        "documentation": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

app.include_router(category_router)
app.include_router(song_router)
app.include_router(video_router)
app.include_router(session_router)