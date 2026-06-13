import Link from "next/link"

import { CATEGORIES } from "@/lib/categories"
import type { EntryListItem } from "@/lib/api/types"

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.type, category.label])
)

function getPreviewImage(entry: EntryListItem): string | null {
  const image = entry.properties.image
  return typeof image === "string" ? image : null
}

function DigitalFire() {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="relative mt-2 flex flex-col items-center gap-3 overflow-hidden border-t border-amber-500/30 py-10 pl-10">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-amber-600/40 via-orange-500/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 animate-pulse bg-gradient-to-t from-red-600/30 via-amber-500/10 to-transparent" />
      <p className="relative z-10 text-xs tracking-[0.3em] text-muted-foreground">{today}</p>
      <p className="relative z-10 animate-pulse text-sm font-bold tracking-[0.4em] text-amber-500">
        [ PENDING ]
      </p>
    </div>
  )
}

export function Timeline({ entries }: { entries: EntryListItem[] }) {
  const items = entries
    .filter((entry) => entry.timeline_date)
    .sort((a, b) => (a.timeline_date! < b.timeline_date! ? -1 : 1))

  if (items.length === 0) {
    return (
      <p className="border border-border bg-card p-6 text-sm text-muted-foreground">
        Хронология пуста — записи с датой пока не добавлены.
      </p>
    )
  }

  return (
    <div className="relative">
      <div className="absolute left-[5px] top-2 bottom-0 w-px bg-gradient-to-b from-amber-500/60 via-amber-500/20 to-transparent" />
      <ol className="flex flex-col">
        {items.map((entry) => {
          const image = getPreviewImage(entry)

          return (
            <li key={entry.id} className="group relative py-6 pl-10">
              <span className="absolute left-0 top-[1.65rem] h-2.5 w-2.5 rounded-full border-2 border-amber-500 bg-neutral-950 transition-colors group-hover:bg-amber-500" />

              <Link href={`/wiki/${entry.slug ?? entry.id}`} className="block">
                <span className="block text-xs tracking-[0.2em] text-muted-foreground">
                  {entry.timeline_date}
                </span>
                <span className="mt-1 block text-base text-foreground transition-colors group-hover:text-amber-400">
                  {entry.title}
                </span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {TYPE_LABELS[entry.type] ?? entry.type}
                </span>
              </Link>

              <div className="pointer-events-none absolute left-full top-4 z-10 ml-6 hidden w-64 border border-border bg-popover p-3 shadow-[0_0_30px_-10px_rgba(245,158,11,0.3)] group-hover:block">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="" className="mb-2 h-28 w-full object-cover" />
                ) : null}
                <p className="text-sm font-medium text-amber-400">{entry.title}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {TYPE_LABELS[entry.type] ?? entry.type}
                </p>
                <p className="text-xs text-muted-foreground">{entry.timeline_date}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <DigitalFire />
    </div>
  )
}
