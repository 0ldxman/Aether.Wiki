from urllib.parse import urlencode

import httpx

from app.config import settings

DISCORD_API = "https://discord.com/api/v10"
DISCORD_AUTHORIZE_URL = "https://discord.com/oauth2/authorize"
SCOPES = "identify guilds.members.read"


def build_authorize_url(state: str) -> str:
    params = {
        "client_id": settings.discord_client_id,
        "redirect_uri": settings.discord_redirect_uri,
        "response_type": "code",
        "scope": SCOPES,
        "state": state,
    }
    return f"{DISCORD_AUTHORIZE_URL}?{urlencode(params)}"


async def exchange_code(code: str) -> dict:
    data = {
        "client_id": settings.discord_client_id,
        "client_secret": settings.discord_client_secret,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.discord_redirect_uri,
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{DISCORD_API}/oauth2/token", data=data)
        response.raise_for_status()
        return response.json()


async def fetch_current_user(access_token: str) -> dict:
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{DISCORD_API}/users/@me", headers=headers)
        response.raise_for_status()
        return response.json()


async def fetch_guild_member_role_ids(access_token: str) -> set[str] | None:
    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"{DISCORD_API}/users/@me/guilds/{settings.discord_guild_id}/member"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

    if response.status_code == 404:
        return None
    response.raise_for_status()
    return set(response.json().get("roles", []))
