import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import { MarkdownContent } from "@/components/markdown-content"
import { serverFetch } from "@/lib/api/server"
import type { EntryListItem, EntryRead, MeResponse } from "@/lib/api/types"
import { CATEGORIES, CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from "@/lib/categories"
import { markdownProseClassName } from "@/lib/markdown"
import { VISIBILITY_META } from "@/lib/visibility"

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.type, category.label])
)

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border pb-2 last:border-b-0 last:pb-0">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}

function ClassifiedStamp() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-6 top-6 z-10 -rotate-12 border-2 border-red-500/70 px-4 py-1 text-lg font-bold tracking-[0.3em] text-red-500/70 mix-blend-lighten"
    >
      CLASSIFIED
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

  const backlinks = await serverFetch<EntryListItem[]>(`/api/entries/${entry.id}/backlinks`)

  const canEdit = user?.global_role === "editor" || user?.global_role === "admin"
  const visibility = VISIBILITY_META[entry.visibility]
  const extraProperties = Object.entries(entry.properties).filter(
    ([key]) => key !== "image" && key !== "date"
  )
  const CategoryIcon = CATEGORY_ICONS[entry.type] ?? DEFAULT_CATEGORY_ICON
  const bannerImage = typeof entry.properties.image === "string" ? entry.properties.image : null
  const isRestricted = entry.visibility === "restricted"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <div className="flex items-end gap-1 text-xs tracking-[0.2em]">
          <Link
            href="/wiki"
            className="border border-b-0 border-border bg-card px-4 py-2 text-muted-foreground transition-colors hover:text-amber-400"
          >
            WIKI
          </Link>
          <Link
            href={`/wiki/${entry.type}`}
            className="flex items-center gap-1.5 border border-b-0 border-border bg-card px-4 py-2 text-muted-foreground transition-colors hover:text-amber-400"
          >
            <CategoryIcon className="size-3.5" />
            {TYPE_LABELS[entry.type] ?? entry.type}
          </Link>
          <span className="border border-b-0 border-amber-500/60 bg-card px-4 py-2 text-amber-400">
            {entry.title}
          </span>
          {canEdit ? (
            <Link
              href={`/wiki/${entry.slug ?? entry.id}/edit`}
              className="ml-auto border border-amber-500/40 bg-card px-4 py-2 text-amber-400 transition-colors hover:bg-amber-500/10"
            >
              [ EDIT ]
            </Link>
          ) : null}
        </div>

        <div className="relative border border-border bg-card">
          {isRestricted ? <ClassifiedStamp /> : null}
          {bannerImage ? (
            <div className="relative h-48 w-full overflow-hidden border-b border-border sm:h-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bannerImage} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_280px]">
            <article className={markdownProseClassName}>
              <MarkdownContent content={entry.content ?? ""} />
            </article>
            <aside className="flex flex-col gap-3 border-t border-border pt-4 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
              <MetaRow label="Тип" value={TYPE_LABELS[entry.type] ?? entry.type} />
              <MetaRow label="Дата события" value={entry.timeline_date ?? "—"} />
              <MetaRow
                label="Уровень доступа"
                value={
                  <Badge variant="outline" className={cn("uppercase tracking-widest", visibility.className)}>
                    {visibility.label}
                  </Badge>
                }
              />
              {extraProperties.map(([key, value]) => (
                <MetaRow key={key} label={key} value={String(value)} />
              ))}
              <MetaRow label="Обновлено" value={formatTimestamp(entry.updated_at)} />
            </aside>
          </div>
        </div>
      </div>

      {backlinks && backlinks.length > 0 ? (
        <div className="border border-border bg-card p-4">
          <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            Упоминается в записях
          </p>
          <ul className="flex flex-wrap gap-2">
            {backlinks.map((item) => {
              const ItemIcon = CATEGORY_ICONS[item.type] ?? DEFAULT_CATEGORY_ICON
              return (
                <li key={item.id}>
                  <Link
                    href={`/wiki/${item.slug ?? item.id}`}
                    className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:border-amber-500/50 hover:text-amber-400"
                  >
                    <ItemIcon className="size-3.5 text-muted-foreground" />
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
