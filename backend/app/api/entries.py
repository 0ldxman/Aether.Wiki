import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from slugify import slugify
from sqlalchemy import delete, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.entry import Entry
from app.models.link import Link
from app.schemas.entry import EntryCreate, EntryListItem, EntryRead, EntryUpdate
from app.services.access import UserContext, can_edit, can_view
from app.services.content import extract_excerpt, extract_properties, extract_timeline_date
from app.services.links import sync_wikilinks

router = APIRouter(prefix="/entries", tags=["entries"])


def _to_list_item(entry: Entry) -> EntryListItem:
    return EntryListItem(
        id=entry.id,
        type=entry.type,
        slug=entry.slug,
        title=entry.title,
        visibility=entry.visibility,
        timeline_date=entry.timeline_date,
        properties=entry.properties,
        excerpt=extract_excerpt(entry.content),
    )


def _visibility_filter(ctx: UserContext):
    """Build a SQL condition matching entries visible to ctx, or None if ctx sees everything."""
    if ctx.global_role == "admin":
        return None

    conditions = [Entry.visibility == "public"]
    if ctx.user_id is not None:
        conditions.append(Entry.visibility == "authenticated")
    if ctx.organization_ids:
        conditions.append(Entry.visibility_orgs.overlap(ctx.organization_ids))
    return or_(*conditions)


async def _get_entry_or_404(id_or_slug: str, db: AsyncSession, ctx: UserContext) -> Entry:
    try:
        entry_id = uuid.UUID(id_or_slug)
    except ValueError:
        entry_id = None

    if entry_id is not None:
        entry = await db.get(Entry, entry_id)
    else:
        result = await db.execute(select(Entry).where(Entry.slug == id_or_slug))
        entry = result.scalar_one_or_none()

    if entry is None or not can_view(entry, ctx):
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


@router.get("", response_model=list[EntryListItem])
async def list_entries(
    type: str | None = None,
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    ctx: UserContext = Depends(get_current_user),
):
    query = select(Entry)
    visibility_filter = _visibility_filter(ctx)
    if visibility_filter is not None:
        query = query.where(visibility_filter)
    if type is not None:
        query = query.where(Entry.type == type)
    query = query.order_by(Entry.title).offset(offset).limit(limit)

    result = await db.execute(query)
    return [_to_list_item(entry) for entry in result.scalars().all()]


@router.get("/{id_or_slug}", response_model=EntryRead)
async def get_entry(
    id_or_slug: str,
    db: AsyncSession = Depends(get_db),
    ctx: UserContext = Depends(get_current_user),
):
    return await _get_entry_or_404(id_or_slug, db, ctx)


@router.post("", response_model=EntryRead, status_code=201)
async def create_entry(
    payload: EntryCreate,
    db: AsyncSession = Depends(get_db),
    ctx: UserContext = Depends(get_current_user),
):
    if not can_edit(ctx):
        raise HTTPException(status_code=403, detail="Not allowed")

    properties = extract_properties(payload.content)
    entry = Entry(
        type=payload.type,
        slug=payload.slug or slugify(payload.title),
        title=payload.title,
        content=payload.content,
        properties=properties,
        timeline_date=extract_timeline_date(properties),
        visibility=payload.visibility,
        visibility_orgs=payload.visibility_orgs,
        created_by=ctx.user_id,
    )
    db.add(entry)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Slug already exists")

    await sync_wikilinks(db, entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.patch("/{entry_id}", response_model=EntryRead)
async def update_entry(
    entry_id: uuid.UUID,
    payload: EntryUpdate,
    db: AsyncSession = Depends(get_db),
    ctx: UserContext = Depends(get_current_user),
):
    if not can_edit(ctx):
        raise HTTPException(status_code=403, detail="Not allowed")

    entry = await db.get(Entry, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")

    data = payload.model_dump(exclude_unset=True)
    content_changed = "content" in data
    for key, value in data.items():
        setattr(entry, key, value)

    if content_changed:
        entry.properties = extract_properties(entry.content)
        entry.timeline_date = extract_timeline_date(entry.properties)

    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Slug already exists")

    if content_changed:
        await sync_wikilinks(db, entry)

    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
async def delete_entry(
    entry_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    ctx: UserContext = Depends(get_current_user),
):
    if not can_edit(ctx):
        raise HTTPException(status_code=403, detail="Not allowed")

    entry = await db.get(Entry, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")

    await db.execute(
        delete(Link).where(or_(Link.source_id == entry_id, Link.target_id == entry_id))
    )
    await db.delete(entry)
    await db.commit()


@router.get("/{entry_id}/backlinks", response_model=list[EntryListItem])
async def get_backlinks(
    entry_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    ctx: UserContext = Depends(get_current_user),
):
    query = (
        select(Entry)
        .join(Link, Link.source_id == Entry.id)
        .where(Link.target_id == entry_id, Link.relation == "mentions")
    )
    visibility_filter = _visibility_filter(ctx)
    if visibility_filter is not None:
        query = query.where(visibility_filter)

    result = await db.execute(query)
    return [_to_list_item(entry) for entry in result.scalars().all()]
