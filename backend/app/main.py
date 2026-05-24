from fastapi import FastAPI
from dotenv import load_dotenv
import os
load_dotenv()

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