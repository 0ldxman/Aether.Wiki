import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

Visibility = Literal["public", "authenticated", "restricted"]


class EntryBase(BaseModel):
    type: str
    slug: str | None = None
    title: str
    content: str | None = None
    visibility: Visibility = "public"
    visibility_orgs: list[uuid.UUID] = []


class EntryCreate(EntryBase):
    pass


class EntryUpdate(BaseModel):
    type: str | None = None
    slug: str | None = None
    title: str | None = None
    content: str | None = None
    visibility: Visibility | None = None
    visibility_orgs: list[uuid.UUID] | None = None


class EntryRead(EntryBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    properties: dict
    timeline_date: date | None
    created_by: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


class EntryListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: str
    slug: str | None
    title: str
    visibility: Visibility
    timeline_date: date | None
    properties: dict
