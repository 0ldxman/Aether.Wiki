"use client"

import { useRouter } from "next/navigation"

import type { MeResponse } from "@/lib/api/types"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ""

export function AuthAction({ user }: { user: MeResponse | null }) {
  const router = useRouter()

  if (!user) {
    return (
      <a
        href={`${BACKEND_URL}/api/auth/discord/login`}
        className="border border-amber-500/40 px-3 py-1.5 text-xs tracking-widest text-amber-400 transition-colors hover:bg-amber-500/10"
      >
        [ LOGIN ]
      </a>
    )
  }

  async function handleLogout() {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="border border-neutral-700 px-3 py-1.5 text-xs tracking-widest text-neutral-400 transition-colors hover:border-red-500/40 hover:text-red-400"
    >
      [ LOGOUT ]
    </button>
  )
}
