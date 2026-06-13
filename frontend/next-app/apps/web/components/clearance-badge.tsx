import { cn } from "@workspace/ui/lib/utils"

import type { MeResponse } from "@/lib/api/types"

const CLEARANCE_LEVELS: Record<MeResponse["global_role"], { label: string; className: string }> = {
  guest: { label: "UNAUTHORIZED", className: "border-red-500/50 text-red-400" },
  member: { label: "ECHO", className: "border-amber-600/50 text-amber-500" },
  editor: { label: "OMEGA", className: "border-amber-500/60 text-amber-400" },
  admin: { label: "EPSILON", className: "border-amber-400/70 text-amber-300" },
}

export function ClearanceBadge({ user }: { user: MeResponse | null }) {
  const level = CLEARANCE_LEVELS[user?.global_role ?? "guest"]

  return (
    <div className="flex items-center gap-2 border border-neutral-700/80 bg-neutral-900/60 px-3 py-1.5">
      {user?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatar_url}
          alt={user.username}
          width={20}
          height={20}
          className="rounded-sm"
        />
      ) : (
        <div className="h-5 w-5 rounded-sm border border-neutral-700 bg-neutral-800" />
      )}
      <span className="text-xs text-neutral-300">{user?.username ?? "GUEST"}</span>
      <span
        className={cn(
          "border px-1.5 py-0.5 text-[10px] font-bold tracking-widest",
          level.className
        )}
      >
        {level.label}
      </span>
    </div>
  )
}
