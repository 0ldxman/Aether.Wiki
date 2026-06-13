import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"

import { serverFetch } from "@/lib/api/server"
import type { MeResponse } from "@/lib/api/types"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ""

type ClearanceLine = {
  text: string
  tone: "info" | "warning"
}

type ClearanceInfo = {
  access: "RESTRICTED" | "GRANTED"
  greeting?: string
  lines: ClearanceLine[]
}

function getClearanceInfo(user: MeResponse | null): ClearanceInfo {
  switch (user?.global_role) {
    case "admin":
      return {
        access: "GRANTED",
        greeting: `Welcome back, commander ${user.username}.`,
        lines: [
          {
            text: "[INFO]: Clearance Level: EPSILON. No further authorization required.",
            tone: "info",
          },
          {
            text: "[INFO]: Full system bandwidth allocated to your session.",
            tone: "info",
          },
        ],
      }
    case "editor":
      return {
        access: "GRANTED",
        greeting: `Welcome back, officer ${user.username}.`,
        lines: [
          {
            text: "[INFO]: Clearance Level: OMEGA. All protocols and encryption overrides are online.",
            tone: "info",
          },
        ],
      }
    case "member":
      return {
        access: "GRANTED",
        greeting: `Welcome back, soldier ${user.username}.`,
        lines: [
          {
            text: "[WARNING]: Clearance Level: ECHO. Proceed with caution.",
            tone: "warning",
          },
        ],
      }
    default:
      return {
        access: "RESTRICTED",
        lines: [
          {
            text: "[WARNING]: Your current clearance level limits data access.",
            tone: "warning",
          },
        ],
      }
  }
}

function TerminalField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-emerald-500/50">{label}:</span>
      <span className="flex-1 truncate border-b border-dashed border-emerald-500/30 pb-1 text-emerald-300">
        {value}
      </span>
      <span className="animate-pulse text-emerald-400">█</span>
    </div>
  )
}

export default async function HomePage() {
  const user = await serverFetch<MeResponse>("/api/auth/me")
  const clearance = getClearanceInfo(user)
  const granted = clearance.access === "GRANTED"

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black p-4 font-mono text-emerald-400">
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(16,185,129,0.05)_0px,rgba(16,185,129,0.05)_1px,transparent_1px,transparent_3px)]" />

      <div className="relative w-full max-w-2xl border border-emerald-500/30 bg-black/80 p-6 shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)] sm:p-10">
        <div className="space-y-1 text-center">
          <h1 className="text-4xl font-bold tracking-[0.3em] sm:text-5xl">AETHER</h1>
          <p className="text-xs tracking-[0.2em] text-emerald-500/60 sm:text-sm">
            ECLIPSE PROTOCOL // SECURE ACCESS TERMINAL
          </p>
        </div>

        <div className="mt-10 space-y-3 text-sm">
          <TerminalField label="LOGIN" value={user?.username ?? "??????"} />
          <TerminalField label="PASSWORD" value="********" />
        </div>

        <div className="mt-8 space-y-2 border-t border-emerald-500/20 pt-6 text-sm">
          <p
            className={cn(
              "text-lg font-bold tracking-widest",
              granted ? "text-emerald-400" : "text-red-500"
            )}
          >
            {granted ? "ACCESS GRANTED" : "ACCESS RESTRICTED"}
          </p>
          {clearance.greeting ? <p>{clearance.greeting}</p> : null}
          {clearance.lines.map((line) => (
            <p
              key={line.text}
              className={line.tone === "warning" ? "text-amber-400" : "text-emerald-400/80"}
            >
              {line.text}
            </p>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          {user ? (
            <Link
              href="/wiki"
              className="border border-emerald-500/40 px-6 py-2 text-sm tracking-widest transition-colors hover:bg-emerald-500/10"
            >
              [ PROCEED ]
            </Link>
          ) : (
            <a
              href={`${BACKEND_URL}/api/auth/discord/login`}
              className="border border-emerald-500/40 px-6 py-2 text-sm tracking-widest transition-colors hover:bg-emerald-500/10"
            >
              [ AUTHENTICATE VIA DISCORD ]
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
