from fastapi import FastAPI
from dotenv import load_dotenv
import os

from app.db.database import engine, Base
from app.models.category import Category
from app.models.song import Song
from app.models.playback_history import PlaybackHistory

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title=os.getenv("APP_NAME"), version=os.getenv("API_VERSION"))

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