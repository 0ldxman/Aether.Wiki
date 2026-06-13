export type Visibility = "public" | "authenticated" | "restricted"

export interface MeResponse {
  id: string
  discord_id: string
  username: string
  avatar_url: string | null
  global_role: "guest" | "member" | "editor" | "admin"
  organization_ids: string[]
}

export interface EntryListItem {
  id: string
  type: string
  slug: string | null
  title: string
  visibility: Visibility
  timeline_date: string | null
}

export interface EntryRead extends EntryListItem {
  content: string | null
  properties: Record<string, unknown>
  visibility_orgs: string[]
  created_by: string | null
  created_at: string
  updated_at: string
}
