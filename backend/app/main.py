from fastapi import FastAPI

app = FastAPI(title="Utube Radio", version="0.1.0")

@app.get("/")
async def root():
    return {"message": "Welcome to Utube Radio API!"}