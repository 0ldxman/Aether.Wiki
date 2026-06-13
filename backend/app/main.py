from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api import auth, entries
from app.config import settings
from app.db import async_session

app = FastAPI(title="AETHER Core API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router, prefix="/api")
app.include_router(entries.router, prefix="/api")


@app.get("/health")
async def health() -> dict[str, str]:
    async with async_session() as session:
        await session.execute(text("SELECT 1"))
    return {"status": "ok"}
