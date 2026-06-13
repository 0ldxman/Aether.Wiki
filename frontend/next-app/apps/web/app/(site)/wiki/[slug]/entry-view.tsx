import Link from "next/link"
import { notFound } from "next/navigation"

import { MarkdownContent } from "@/components/markdown-content"
import { serverFetch } from "@/lib/api/server"
import type { EntryRead, MeResponse } from "@/lib/api/types"
import { CATEGORIES } from "@/lib/categories"
import { markdownProseClassName } from "@/lib/markdown"
import { VISIBILITY_META } from "@/lib/visibility"

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.type, category.label])
)

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-neutral-800 pb-2 last:border-b-0 last:pb-0">
      <span className="text-[10px] uppercase tracking-widest text-neutral-500">{label}</span>
      <span className="text-sm text-neutral-200">{value}</span>
    </div>
  )
}

function formatTimestamp(value: string): string {
  return new Date(value).toISOString().slice(0, 16).replace("T", " ")
}

export async function EntryView({ slug }: { slug: string }) {
  const [entry, user] = await Promise.all([
    serverFetch<EntryRead>(`/api/entries/${slug}`),
    serverFetch<MeResponse>("/api/auth/me"),
  ])

  if (!entry) {
    notFound()
  }

  const canEdit = user?.global_role === "editor" || user?.global_role === "admin"
  const visibility = VISIBILITY_META[entry.visibility]
  const extraProperties = Object.entries(entry.properties).filter(
    ([key]) => key !== "image" && key !== "date"
  )

  return (
    <div className="flex flex-col">
      <div className="flex items-end gap-1 text-xs tracking-[0.2em]">
        <Link
          href="/wiki"
          className="border border-b-0 border-neutral-700/80 bg-neutral-900/60 px-4 py-2 text-neutral-500 transition-colors hover:text-amber-400"
        >
          WIKI
        </Link>
        <Link
          href={`/wiki/${entry.type}`}
          className="border border-b-0 border-neutral-700/80 bg-neutral-900/60 px-4 py-2 text-neutral-400 transition-colors hover:text-amber-400"
        >
          {TYPE_LABELS[entry.type] ?? entry.type}
        </Link>
        <span className="border border-b-0 border-amber-500/60 bg-neutral-900/60 px-4 py-2 text-amber-400">
          {entry.title}
        </span>
        {canEdit ? (
          <Link
            href={`/wiki/${entry.slug ?? entry.id}/edit`}
            className="ml-auto border border-amber-500/40 bg-neutral-900/60 px-4 py-2 text-amber-400 transition-colors hover:bg-amber-500/10"
          >
            [ EDIT ]
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 border border-neutral-700/80 bg-neutral-900/40 p-6 lg:grid-cols-[1fr_280px]">
        <article className={markdownProseClassName}>
          <MarkdownContent content={entry.content ?? ""} />
        </article>
        <aside className="flex flex-col gap-3 border-t border-neutral-800 pt-4 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
          <MetaRow label="Тип" value={TYPE_LABELS[entry.type] ?? entry.type} />
          <MetaRow label="Дата события" value={entry.timeline_date ?? "—"} />
          <MetaRow
            label="Уровень доступа"
            value={<span className={visibility.className}>{visibility.label}</span>}
          />
          {extraProperties.map(([key, value]) => (
            <MetaRow key={key} label={key} value={String(value)} />
          ))}
          <MetaRow label="Обновлено" value={formatTimestamp(entry.updated_at)} />
        </aside>
      </div>
    </div>
  )
}
