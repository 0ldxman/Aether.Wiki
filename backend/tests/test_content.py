from datetime import date, datetime

from slugify import slugify

from app.services.content import (
    extract_properties,
    extract_timeline_date,
    extract_wikilink_slugs,
)


def test_extract_properties_with_frontmatter():
    content = """---
status: active
date: "2187-03-14"
---
# Title

Body text.
"""
    props = extract_properties(content)
    assert props["status"] == "active"
    assert props["date"] == "2187-03-14"


def test_extract_properties_without_frontmatter():
    assert extract_properties("# Just a heading\n\nbody") == {}


def test_extract_properties_empty_content():
    assert extract_properties(None) == {}
    assert extract_properties("") == {}


def test_extract_wikilink_slugs_plain():
    content = "See [[Protocol Apollo]] and [[New Eden]]."
    assert extract_wikilink_slugs(content) == {"protocol-apollo", "new-eden"}


def test_extract_wikilink_slugs_with_alias():
    content = "[[Протокол Аполлон->Аполлон]] упомянул событие [[Большая Охота->охоту]]"
    assert extract_wikilink_slugs(content) == {
        slugify("Протокол Аполлон"),
        slugify("Большая Охота"),
    }


def test_extract_wikilink_slugs_no_links():
    assert extract_wikilink_slugs("just plain text") == set()


def test_extract_wikilink_slugs_none():
    assert extract_wikilink_slugs(None) == set()


def test_extract_timeline_date_unquoted_yaml_date():
    assert extract_timeline_date({"date": date(2187, 3, 14)}) == date(2187, 3, 14)


def test_extract_timeline_date_quoted_string():
    assert extract_timeline_date({"date": "2187-03-14"}) == date(2187, 3, 14)


def test_extract_timeline_date_datetime_value():
    assert extract_timeline_date({"date": datetime(2187, 3, 14, 12, 30)}) == date(2187, 3, 14)


def test_extract_timeline_date_invalid_string():
    assert extract_timeline_date({"date": "not-a-date"}) is None


def test_extract_timeline_date_missing():
    assert extract_timeline_date({}) is None
