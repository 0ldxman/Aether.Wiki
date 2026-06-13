import secrets
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.config import settings
from app.models.user import User
from app.schemas.user import MeResponse
from app.services import discord
from app.services.auth import (
    create_session_token,
    decode_session_payload,
    resolve_global_role,
    resolve_organization_ids,
)

router = APIRouter(prefix="/auth", tags=["auth"])

OAUTH_STATE_COOKIE = "oauth_state"
SESSION_COOKIE = "session"


def _avatar_url(discord_user: dict) -> str | None:
    avatar_hash = discord_user.get("avatar")
    if not avatar_hash:
        return None
    return f"https://cdn.discordapp.com/avatars/{discord_user['id']}/{avatar_hash}.png"


@router.get("/discord/login")
async def discord_login() -> RedirectResponse:
    state = secrets.token_urlsafe(16)
    redirect = RedirectResponse(discord.build_authorize_url(state))
    redirect.set_cookie(
        OAUTH_STATE_COOKIE,
        state,
        max_age=600,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/api/auth",
    )
    return redirect


@router.get("/discord/callback")
async def discord_callback(
    request: Request,
    db: AsyncSession = Depends(get_db),
    code: str | None = Query(None),
    state: str | None = Query(None),
    error: str | None = Query(None),
) -> RedirectResponse:
    if error is not None:
        return RedirectResponse(f"{settings.frontend_url}?auth_error={error}")

    expected_state = request.cookies.get(OAUTH_STATE_COOKIE)
    if not state or not expected_state or state != expected_state:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    if not code:
        raise HTTPException(status_code=400, detail="Missing OAuth code")

    token_response = await discord.exchange_code(code)
    access_token = token_response["access_token"]

    discord_user = await discord.fetch_current_user(access_token)
    role_ids = await discord.fetch_guild_member_role_ids(access_token)

    global_role = resolve_global_role(role_ids)
    organization_ids = await resolve_organization_ids(db, role_ids)

    result = await db.execute(select(User).where(User.discord_id == discord_user["id"]))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(discord_id=discord_user["id"])
        db.add(user)

    user.username = discord_user["username"]
    user.avatar_url = _avatar_url(discord_user)
    user.last_login_at = datetime.now(timezone.utc)

    await db.flush()
    await db.commit()
    await db.refresh(user)

    session_token = create_session_token(user, global_role, organization_ids)

    redirect = RedirectResponse(settings.frontend_url)
    redirect.delete_cookie(OAUTH_STATE_COOKIE, path="/api/auth")
    redirect.set_cookie(
        SESSION_COOKIE,
        session_token,
        max_age=settings.session_max_age,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )
    return redirect


@router.get("/me", response_model=MeResponse)
async def me(request: Request) -> MeResponse:
    token = request.cookies.get(SESSION_COOKIE)
    payload = decode_session_payload(token) if token else None
    if payload is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return MeResponse(
        id=uuid.UUID(payload["sub"]),
        discord_id=payload["discord_id"],
        username=payload["username"],
        avatar_url=payload.get("avatar_url"),
        global_role=payload.get("global_role", "guest"),
        organization_ids=[uuid.UUID(org_id) for org_id in payload.get("organization_ids", [])],
    )


@router.post("/logout")
async def logout(response: Response) -> dict[str, str]:
    response.delete_cookie(SESSION_COOKIE, path="/")
    return {"status": "ok"}
