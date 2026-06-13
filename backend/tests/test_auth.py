import uuid
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi import Request

from app.api.deps import get_current_user
from app.config import settings
from app.models.user import User
from app.services.auth import (
    create_session_token,
    decode_session_payload,
    decode_session_token,
    resolve_global_role,
)


@pytest.fixture
def role_config(monkeypatch):
    monkeypatch.setattr(settings, "discord_admin_role_ids", "111")
    monkeypatch.setattr(settings, "discord_editor_role_ids", "222,333")


def test_resolve_global_role_admin(role_config):
    assert resolve_global_role({"111"}) == "admin"


def test_resolve_global_role_editor(role_config):
    assert resolve_global_role({"333"}) == "editor"


def test_resolve_global_role_member(role_config):
    assert resolve_global_role({"999"}) == "member"


def test_resolve_global_role_guest_when_not_in_guild(role_config):
    assert resolve_global_role(None) == "guest"


def test_resolve_global_role_admin_takes_priority(role_config):
    assert resolve_global_role({"111", "222"}) == "admin"


def make_user() -> User:
    return User(
        id=uuid.uuid4(),
        discord_id="123456789",
        username="tester",
        avatar_url="https://cdn.discordapp.com/avatars/123456789/abc.png",
    )


def test_session_token_round_trip():
    user = make_user()
    org_id = uuid.uuid4()
    token = create_session_token(user, "editor", [org_id])

    ctx = decode_session_token(token)
    assert ctx is not None
    assert ctx.user_id == user.id
    assert ctx.global_role == "editor"
    assert ctx.organization_ids == [org_id]

    payload = decode_session_payload(token)
    assert payload["discord_id"] == user.discord_id
    assert payload["username"] == user.username
    assert payload["avatar_url"] == user.avatar_url


def test_decode_invalid_token():
    assert decode_session_token("not-a-jwt") is None
    assert decode_session_payload("not-a-jwt") is None


def test_decode_expired_token():
    user = make_user()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "discord_id": user.discord_id,
        "username": user.username,
        "avatar_url": user.avatar_url,
        "global_role": "member",
        "organization_ids": [],
        "iat": now - timedelta(days=10),
        "exp": now - timedelta(days=3),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    assert decode_session_token(token) is None
    assert decode_session_payload(token) is None


def _request_with_cookie(cookie_header: bytes | None) -> Request:
    headers = [(b"cookie", cookie_header)] if cookie_header else []
    return Request({"type": "http", "headers": headers})


@pytest.mark.asyncio
async def test_get_current_user_without_cookie():
    ctx = await get_current_user(_request_with_cookie(None))
    assert ctx.user_id is None
    assert ctx.global_role == "guest"


@pytest.mark.asyncio
async def test_get_current_user_with_valid_cookie():
    user = make_user()
    token = create_session_token(user, "admin", [])

    ctx = await get_current_user(_request_with_cookie(f"session={token}".encode()))
    assert ctx.user_id == user.id
    assert ctx.global_role == "admin"


@pytest.mark.asyncio
async def test_get_current_user_with_invalid_cookie():
    ctx = await get_current_user(_request_with_cookie(b"session=not-a-jwt"))
    assert ctx.user_id is None
    assert ctx.global_role == "guest"
