import Link from "next/link"

import { EntryBrowser } from "@/components/entry-browser"
import { serverFetch } from "@/lib/api/server"
import type { EntryListItem, MeResponse } from "@/lib/api/types"
import type { CATEGORIES } from "@/lib/categories"

export async function CategoryView({ category }: { category: (typeof CATEGORIES)[number] }) {
  const [entries, user] = await Promise.all([
    serverFetch<EntryListItem[]>(`/api/entries?type=${category.type}&limit=200`),
    serverFetch<MeResponse>("/api/auth/me"),
  ])
  const canEdit = user?.global_role === "editor" || user?.global_role === "admin"
  const Icon = category.icon

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="flex items-center justify-center gap-3 text-3xl font-bold tracking-[0.3em] text-amber-500 sm:text-4xl">
          <Icon className="size-7 sm:size-8" />
          {category.label}
        </h1>
        <p className="mt-1 text-xs tracking-[0.3em] text-muted-foreground">CATEGORY ARCHIVE</p>
      </div>
      {canEdit ? (
        <div className="flex justify-end">
          <Link
            href={`/wiki/new?type=${category.type}`}
            className="border border-amber-500/40 px-4 py-2 text-xs tracking-widest text-amber-400 transition-colors hover:bg-amber-500/10"
          >
            [ + НОВАЯ ЗАПИСЬ ]
          </Link>
        </div>
      ) : null}
      <EntryBrowser entries={entries ?? []} />
    </div>
  )
}
