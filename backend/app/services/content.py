import re

import frontmatter
from slugify import slugify

WIKILINK_RE = re.compile(r"\[\[(.+?)\]\]")


def extract_properties(content: str | None) -> dict:
    """Parse YAML frontmatter from markdown content into a properties dict."""
    if not content:
        return {}
    post = frontmatter.loads(content)
    return dict(post.metadata)


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
