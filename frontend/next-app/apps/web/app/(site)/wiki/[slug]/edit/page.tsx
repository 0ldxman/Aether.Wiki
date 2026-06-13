import { notFound } from "next/navigation"

import { EntryForm } from "@/components/entry-form"
import { HudPanel } from "@/components/hud-panel"
import { serverFetch } from "@/lib/api/server"
import type { EntryRead, MeResponse } from "@/lib/api/types"

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [entry, user] = await Promise.all([
    serverFetch<EntryRead>(`/api/entries/${slug}`),
    serverFetch<MeResponse>("/api/auth/me"),
  ])

  if (!entry) {
    notFound()
  }

  const canEdit = user?.global_role === "editor" || user?.global_role === "admin"
  if (!canEdit) {
    return (
      <HudPanel label="ACCESS DENIED" className="mx-auto max-w-xl text-center">
        <p className="text-red-400">
          [WARNING]: Недостаточный уровень допуска для редактирования записей.
        </p>
      </HudPanel>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-[0.3em] text-amber-500">РЕДАКТИРОВАНИЕ</h1>
        <p className="mt-1 text-xs tracking-[0.3em] text-neutral-500">{entry.title}</p>
      </div>
      <EntryForm mode="edit" entry={entry} />
    </div>
  )
}
