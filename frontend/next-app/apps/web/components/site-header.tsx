import Link from "next/link"

import { serverFetch } from "@/lib/api/server"
import type { MeResponse } from "@/lib/api/types"
import { AuthAction } from "@/components/auth-action"
import { CategoryNav } from "@/components/category-nav"
import { ClearanceBadge } from "@/components/clearance-badge"

export async function SiteHeader() {
  const user = await serverFetch<MeResponse>("/api/auth/me")

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="text-sm font-bold tracking-[0.3em] text-amber-500">
            AETHER
          </Link>
          <Link
            href="/wiki"
            className="border border-neutral-700/80 bg-neutral-900/40 px-3 py-1.5 text-xs tracking-[0.2em] text-neutral-300 transition-colors hover:border-amber-500/50 hover:text-amber-400"
          >
            [ОБЗОР]
          </Link>
          <CategoryNav />
        </div>
        <div className="flex items-center gap-3">
          <ClearanceBadge user={user} />
          <AuthAction user={user} />
        </div>
      </div>
    </header>
  )
}
