import uuid

from app.models.entry import Entry
from app.services.access import UserContext, can_edit, can_view


def make_entry(visibility="public", visibility_orgs=None) -> Entry:
    return Entry(
        type="character",
        title="Test",
        visibility=visibility,
        visibility_orgs=visibility_orgs or [],
    )


def test_public_entry_visible_to_guest():
    assert can_view(make_entry(visibility="public"), UserContext())


def test_authenticated_entry_hidden_from_guest():
    assert not can_view(make_entry(visibility="authenticated"), UserContext())


def test_authenticated_entry_visible_to_logged_in_user():
    ctx = UserContext(user_id=uuid.uuid4())
    assert can_view(make_entry(visibility="authenticated"), ctx)


def test_restricted_entry_visible_to_org_member():
    org_id = uuid.uuid4()
    entry = make_entry(visibility="restricted", visibility_orgs=[org_id])
    ctx = UserContext(user_id=uuid.uuid4(), organization_ids=[org_id])
    assert can_view(entry, ctx)


def test_restricted_entry_hidden_from_other_org():
    entry = make_entry(visibility="restricted", visibility_orgs=[uuid.uuid4()])
    ctx = UserContext(user_id=uuid.uuid4(), organization_ids=[uuid.uuid4()])
    assert not can_view(entry, ctx)


def test_restricted_entry_hidden_from_guest():
    entry = make_entry(visibility="restricted", visibility_orgs=[uuid.uuid4()])
    assert not can_view(entry, UserContext())


def test_admin_sees_everything():
    entry = make_entry(visibility="restricted", visibility_orgs=[uuid.uuid4()])
    assert can_view(entry, UserContext(global_role="admin"))


def test_can_edit_roles():
    assert can_edit(UserContext(global_role="editor"))
    assert can_edit(UserContext(global_role="admin"))
    assert not can_edit(UserContext(global_role="member"))
    assert not can_edit(UserContext())
