import re
from datetime import date, datetime

import frontmatter
from slugify import slugify

WIKILINK_RE = re.compile(r"\[\[(.+?)\]\]")


def _json_safe(value):
    """Recursively convert YAML-parsed values into JSON-serializable equivalents.

    PyYAML parses unquoted dates/datetimes into `date`/`datetime` objects,
    which the JSONB column's default JSON serializer can't handle.
    """
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, dict):
        return {key: _json_safe(v) for key, v in value.items()}
    if isinstance(value, list):
        return [_json_safe(v) for v in value]
    return value


def extract_properties(content: str | None) -> dict:
    """Parse YAML frontmatter from markdown content into a properties dict."""
    if not content:
        return {}
    post = frontmatter.loads(content)
    return {key: _json_safe(value) for key, value in post.metadata.items()}


def extract_timeline_date(properties: dict) -> date | None:
    """Pull the `date` property out as a date, if present and valid.

    YAML parses unquoted dates (e.g. `date: 2187-03-14`) as date/datetime
    objects, but quoted dates come through as plain strings - handle both.
    """
    value = properties.get("date")
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        try:
            return date.fromisoformat(value)
        except ValueError:
            return None
    return None


def extract_wikilink_slugs(content: str | None) -> set[str]:
    """Extract slugified link targets from [[Target]] / [[Target->Display]] wikilinks."""
    if not content:
        return set()
    slugs = set()
    for match in WIKILINK_RE.finditer(content):
        target = match.group(1).split("->")[0].strip()
        if target:
            slugs.add(slugify(target))
    return slugs
