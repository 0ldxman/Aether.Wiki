from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entry import Entry
from app.models.link import Link
from app.services.content import extract_wikilink_slugs


async def sync_wikilinks(session: AsyncSession, entry: Entry) -> None:
    """Recompute outgoing 'mentions' links for an entry based on [[wikilinks]] in its content.

    Requires entry.id to already be assigned (entry must be flushed/persisted).
    """
    await session.execute(
        delete(Link).where(Link.source_id == entry.id, Link.relation == "mentions")
    )

    slugs = extract_wikilink_slugs(entry.content)
    if not slugs:
        return

    result = await session.execute(select(Entry.id).where(Entry.slug.in_(slugs)))
    for (target_id,) in result.all():
        session.add(Link(source_id=entry.id, target_id=target_id, relation="mentions"))
