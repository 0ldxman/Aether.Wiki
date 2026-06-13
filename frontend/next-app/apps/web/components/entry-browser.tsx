"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/toggle-group"
import { cn } from "@workspace/ui/lib/utils"

import type { EntryListItem } from "@/lib/api/types"
import { VISIBILITY_META } from "@/lib/visibility"

function getPreviewImage(entry: EntryListItem): string | null {
  const image = entry.properties.image
  return typeof image === "string" ? image : null
}

function EntryCard({ entry }: { entry: EntryListItem }) {
  const image = getPreviewImage(entry)
  const visibility = VISIBILITY_META[entry.visibility]

  return (
    <Link
      href={`/wiki/${entry.slug ?? entry.id}`}
      className="group flex flex-col border border-border bg-card transition-colors hover:border-amber-500/50"
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="h-32 w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
        />
      ) : (
        <div className="h-32 w-full bg-[repeating-linear-gradient(45deg,rgba(245,158,11,0.05)_0px,rgba(245,158,11,0.05)_2px,transparent_2px,transparent_8px)]" />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between text-[10px] tracking-widest">
          <span className="text-muted-foreground">{entry.timeline_date ?? "—"}</span>
          <Badge variant="outline" className={cn("uppercase tracking-widest", visibility.className)}>
            {visibility.label}
          </Badge>
        </div>
        <h3 className="text-sm font-medium text-foreground transition-colors group-hover:text-amber-400">
          {entry.title}
        </h3>
        {entry.excerpt ? (
          <p className="line-clamp-3 text-xs text-muted-foreground">{entry.excerpt}</p>
        ) : null}
      </div>
    </Link>
  )
}

function EntryTable({ entries }: { entries: EntryListItem[] }) {
  return (
    <div className="border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4 text-[10px] font-normal uppercase tracking-widest text-muted-foreground">
              Название
            </TableHead>
            <TableHead className="px-4 text-[10px] font-normal uppercase tracking-widest text-muted-foreground">
              Дата
            </TableHead>
            <TableHead className="px-4 text-[10px] font-normal uppercase tracking-widest text-muted-foreground">
              Доступ
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const visibility = VISIBILITY_META[entry.visibility]
            return (
              <TableRow key={entry.id}>
                <TableCell className="px-4 py-2 whitespace-normal">
                  <Link
                    href={`/wiki/${entry.slug ?? entry.id}`}
                    className="text-foreground transition-colors hover:text-amber-400"
                  >
                    {entry.title}
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-2 text-muted-foreground">
                  {entry.timeline_date ?? "—"}
                </TableCell>
                <TableCell className="px-4 py-2">
                  <Badge variant="outline" className={cn("uppercase tracking-widest", visibility.className)}>
                    {visibility.label}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export function EntryBrowser({ entries }: { entries: EntryListItem[] }) {
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"cards" | "table">("cards")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) || entry.excerpt.toLowerCase().includes(q)
    )
  }, [entries, query])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ПОИСК ПО АРХИВУ..."
          className="w-full max-w-sm border border-input bg-neutral-900/60 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-amber-500/50 focus:outline-none"
        />
        <ToggleGroup
          type="single"
          variant="outline"
          value={view}
          onValueChange={(value) => value && setView(value as "cards" | "table")}
          className="text-xs tracking-widest"
        >
          <ToggleGroupItem value="cards" className="px-3">
            КАРТОЧКИ
          </ToggleGroupItem>
          <ToggleGroupItem value="table" className="px-3">
            ТАБЛИЦА
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <p className="text-xs tracking-widest text-muted-foreground">НАЙДЕНО ЗАПИСЕЙ: {filtered.length}</p>

      {filtered.length === 0 ? (
        <p className="border border-border bg-card p-6 text-sm text-muted-foreground">
          Записи не найдены.
        </p>
      ) : view === "cards" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <EntryTable entries={filtered} />
      )}
    </div>
  )
}
