import Link from "next/link"

import { serverFetch } from "@/lib/api/server"
import type { MeResponse } from "@/lib/api/types"
import { AuthAction } from "@/components/auth-action"
import { ClearanceBadge } from "@/components/clearance-badge"

export async function SiteHeader() {
  const user = await serverFetch<MeResponse>("/api/auth/me")

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between gap-4 p-4">
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-bold tracking-[0.3em] text-amber-500">
            AETHER
          </Link>
          <Link
            href="/wiki"
            className="text-xs tracking-[0.2em] text-neutral-400 transition-colors hover:text-amber-400"
          >
            ECLIPSE PROTOCOL
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <ClearanceBadge user={user} />
          <AuthAction user={user} />
        </div>
      </div>
    </header>
  )
}
