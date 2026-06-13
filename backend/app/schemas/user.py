import uuid

from pydantic import BaseModel


class MeResponse(BaseModel):
    id: uuid.UUID
    discord_id: str
    username: str
    avatar_url: str | None
    global_role: str
    organization_ids: list[uuid.UUID]
