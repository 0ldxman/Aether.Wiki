import uuid
from datetime import datetime, timedelta, timezone

import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.entry import Entry
from app.models.user import User
from app.services.access import UserContext


def resolve_global_role(role_ids: set[str] | None) -> str:
    if role_ids is None:
        return "guest"
    if role_ids & settings.admin_role_id_set:
        return "admin"
    if role_ids & settings.editor_role_id_set:
        return "editor"
    return "member"


async def resolve_organization_ids(db: AsyncSession, role_ids: set[str] | None) -> list[uuid.UUID]:
    if not role_ids:
        return []

    stmt = select(Entry.id).where(
        Entry.type == "organization",
        Entry.properties["discord_role_id"].astext.in_(role_ids),
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


def create_session_token(user: User, global_role: str, organization_ids: list[uuid.UUID]) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "discord_id": user.discord_id,
        "username": user.username,
        "avatar_url": user.avatar_url,
        "global_role": global_role,
        "organization_ids": [str(org_id) for org_id in organization_ids],
        "iat": now,
        "exp": now + timedelta(seconds=settings.session_max_age),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_session_payload(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.InvalidTokenError:
        return None


def decode_session_token(token: str) -> UserContext | None:
    payload = decode_session_payload(token)
    if payload is None:
        return None

    try:
        return UserContext(
            user_id=uuid.UUID(payload["sub"]),
            global_role=payload.get("global_role", "guest"),
            organization_ids=[uuid.UUID(org_id) for org_id in payload.get("organization_ids", [])],
        )
    except (KeyError, ValueError):
        return None
