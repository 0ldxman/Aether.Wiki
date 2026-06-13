import Link from "next/link"

import { serverFetch } from "@/lib/api/server"
import type { EntryListItem } from "@/lib/api/types"

export default async function WikiPage() {
  const entries = await serverFetch<EntryListItem[]>("/api/entries")

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-medium">Wiki</h1>
      <ul className="flex flex-col gap-2">
        {(entries ?? []).map((entry) => (
          <li key={entry.id}>
            <Link href={`/wiki/${entry.slug ?? entry.id}`} className="underline">
              {entry.title}
            </Link>{" "}
            <span className="text-muted-foreground text-sm">
              ({entry.type})
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
