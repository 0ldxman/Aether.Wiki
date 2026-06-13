"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

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
      className="group flex flex-col border border-neutral-700/80 bg-neutral-900/40 transition-colors hover:border-amber-500/50"
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
          <span className="text-neutral-500">{entry.timeline_date ?? "—"}</span>
          <span className={visibility.className}>{visibility.label}</span>
        </div>
        <h3 className="text-sm font-medium text-neutral-200 transition-colors group-hover:text-amber-400">
          {entry.title}
        </h3>
        {entry.excerpt ? (
          <p className="line-clamp-3 text-xs text-neutral-500">{entry.excerpt}</p>
        ) : null}
      </div>
    </Link>
  )
}

function EntryTable({ entries }: { entries: EntryListItem[] }) {
  return (
    <div className="overflow-x-auto border border-neutral-700/80">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-neutral-700/80 bg-neutral-900/60 text-[10px] uppercase tracking-widest text-neutral-500">
          <tr>
            <th className="px-4 py-2 font-normal">Название</th>
            <th className="px-4 py-2 font-normal">Дата</th>
            <th className="px-4 py-2 font-normal">Доступ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {entries.map((entry) => {
            const visibility = VISIBILITY_META[entry.visibility]
            return (
              <tr key={entry.id} className="transition-colors hover:bg-neutral-900/60">
                <td className="px-4 py-2">
                  <Link
                    href={`/wiki/${entry.slug ?? entry.id}`}
                    className="text-neutral-200 transition-colors hover:text-amber-400"
                  >
                    {entry.title}
                  </Link>
                </td>
                <td className="px-4 py-2 text-neutral-500">{entry.timeline_date ?? "—"}</td>
                <td className={cn("px-4 py-2 text-xs tracking-widest", visibility.className)}>
                  {visibility.label}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
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
          className="w-full max-w-sm border border-neutral-700/80 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-amber-500/50 focus:outline-none"
        />
        <div className="flex items-center gap-2 text-xs tracking-widest">
          <button
            onClick={() => setView("cards")}
            className={cn(
              "border px-3 py-1.5 transition-colors",
              view === "cards"
                ? "border-amber-500/60 text-amber-400"
                : "border-neutral-700/80 text-neutral-500 hover:text-neutral-300"
            )}
          >
            КАРТОЧКИ
          </button>
          <button
            onClick={() => setView("table")}
            className={cn(
              "border px-3 py-1.5 transition-colors",
              view === "table"
                ? "border-amber-500/60 text-amber-400"
                : "border-neutral-700/80 text-neutral-500 hover:text-neutral-300"
            )}
          >
            ТАБЛИЦА
          </button>
        </div>
      </div>

      <p className="text-xs tracking-widest text-neutral-500">НАЙДЕНО ЗАПИСЕЙ: {filtered.length}</p>

      {filtered.length === 0 ? (
        <p className="border border-neutral-700/80 bg-neutral-900/40 p-6 text-sm text-neutral-500">
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
