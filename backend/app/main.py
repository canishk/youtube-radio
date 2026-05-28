from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.db.database import engine, Base
from app.models.category import Category
from app.models.song import Song
from app.models.playback_history import PlaybackHistory

from app.db.session import SessionLocal
from app.services.seed_service import seed_categories

from app.api.category_routes import router as category_router


load_dotenv()

Base.metadata.create_all(bind=engine)

db = SessionLocal()
seed_categories(db)
db.close()

app = FastAPI(title=os.getenv("APP_NAME"), version=os.getenv("API_VERSION"))

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