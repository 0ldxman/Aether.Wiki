import uuid

from sqlalchemy import ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Link(Base):
    __tablename__ = "links"
    __table_args__ = (
        Index("ix_links_source_relation", "source_id", "relation"),
        Index("ix_links_target_relation", "target_id", "relation"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid()
    )
    source_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entries.id"), index=True)
    target_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entries.id"), index=True)
    relation: Mapped[str] = mapped_column(String(50), index=True)
    meta: Mapped[dict] = mapped_column(JSONB, server_default="{}")
