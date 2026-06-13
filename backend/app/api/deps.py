from fastapi import Request

from app.db import get_session as get_db
from app.services.access import UserContext
from app.services.auth import decode_session_token

__all__ = ["get_db", "get_current_user"]


async def get_current_user(request: Request) -> UserContext:
    token = request.cookies.get("session")
    if not token:
        return UserContext()
    return decode_session_token(token) or UserContext()
