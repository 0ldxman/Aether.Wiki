import Link from "next/link"

import { serverFetch } from "@/lib/api/server"
import type { MeResponse } from "@/lib/api/types"
import { UserMenu } from "@/components/user-menu"

export async function SiteHeader() {
  const user = await serverFetch<MeResponse>("/api/auth/me")

  return (
    <header className="flex items-center justify-between border-b p-4">
      <nav className="flex items-center gap-4">
        <Link href="/" className="font-medium">
          AETHER
        </Link>
        <Link href="/wiki" className="text-sm">
          Wiki
        </Link>
      </nav>
      <UserMenu user={user} />
    </header>
  )
}
