import uuid
from dataclasses import dataclass, field

from app.models.entry import Entry


@dataclass
class UserContext:
    user_id: uuid.UUID | None = None
    global_role: str = "guest"  # guest | member | editor | admin
    organization_ids: list[uuid.UUID] = field(default_factory=list)


def can_view(entry: Entry, ctx: UserContext) -> bool:
    if ctx.global_role == "admin":
        return True
    if entry.visibility == "public":
        return True
    if entry.visibility == "authenticated":
        return ctx.user_id is not None
    if entry.visibility == "restricted":
        return bool(set(entry.visibility_orgs) & set(ctx.organization_ids))
    return False


def can_edit(ctx: UserContext) -> bool:
    return ctx.global_role in ("editor", "admin")
