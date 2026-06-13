import { EntryForm } from "@/components/entry-form"
import { HudPanel } from "@/components/hud-panel"
import { serverFetch } from "@/lib/api/server"
import type { MeResponse } from "@/lib/api/types"

export default async function NewEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const user = await serverFetch<MeResponse>("/api/auth/me")
  const canEdit = user?.global_role === "editor" || user?.global_role === "admin"

  if (!canEdit) {
    return (
      <HudPanel label="ACCESS DENIED" className="mx-auto max-w-xl text-center">
        <p className="text-red-400">
          [WARNING]: Недостаточный уровень допуска для создания записей.
        </p>
      </HudPanel>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-[0.3em] text-amber-500">НОВАЯ ЗАПИСЬ</h1>
      </div>
      <EntryForm mode="create" initialType={type} />
    </div>
  )
}
