"use client"

import { useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"

import type { MeResponse } from "@/lib/api/types"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ""

export function UserMenu({ user }: { user: MeResponse | null }) {
  const router = useRouter()

  if (!user) {
    return (
      <Button asChild size="sm">
        <a href={`${BACKEND_URL}/api/auth/discord/login`}>Войти через Discord</a>
      </Button>
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
    <div className="flex items-center gap-2">
      {user.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatar_url}
          alt={user.username}
          width={24}
          height={24}
          className="rounded-full"
        />
      ) : null}
      <span className="text-sm">
        {user.username}{" "}
        <span className="text-muted-foreground">({user.global_role})</span>
      </span>
      <Button size="sm" variant="outline" onClick={handleLogout}>
        Выйти
      </Button>
    </div>
  )
}
