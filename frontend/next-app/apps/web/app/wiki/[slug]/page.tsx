import { notFound } from "next/navigation"

import { serverFetch } from "@/lib/api/server"
import type { EntryRead } from "@/lib/api/types"
import { MarkdownContent } from "@/components/markdown-content"

export default async function EntryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = await serverFetch<EntryRead>(`/api/entries/${slug}`)

  if (!entry) {
    notFound()
  }

  return (
    <article className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-medium">{entry.title}</h1>
        <p className="text-muted-foreground text-sm">
          {entry.type}
          {entry.timeline_date ? ` · ${entry.timeline_date}` : ""}
        </p>
      </div>
      <MarkdownContent content={entry.content ?? ""} />
    </article>
  )
}
