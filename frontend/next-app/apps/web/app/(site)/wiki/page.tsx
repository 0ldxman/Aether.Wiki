import { Timeline } from "@/components/timeline"
import { serverFetch } from "@/lib/api/server"
import type { EntryListItem } from "@/lib/api/types"

export default async function WikiPage() {
  const entries = await serverFetch<EntryListItem[]>("/api/entries?limit=200")

  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-[0.3em] text-amber-500 sm:text-4xl">
            ECLIPSE PROTOCOL
          </h1>
          <p className="mt-1 text-xs tracking-[0.3em] text-neutral-500">INITIALIZED</p>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-400">
          Архив проекта «Эклипс» — централизованная база данных по событиям, технологиям,
          локациям, фракциям и фигурам, задействованным в протоколе. Доступ к материалам
          определяется уровнем допуска текущей сессии.
        </p>
      </section>

      <section>
        <Timeline entries={entries ?? []} />
      </section>
    </div>
  )
}
