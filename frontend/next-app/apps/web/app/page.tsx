import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"

import { HudPanel } from "@/components/hud-panel"
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
      <span className="w-24 shrink-0 text-neutral-500">{label}:</span>
      <span className="flex-1 truncate border-b border-dashed border-amber-500/30 pb-1 text-neutral-200">
        {value}
      </span>
      <span className="animate-pulse text-amber-500">█</span>
    </div>
  )
}

export default async function HomePage() {
  const user = await serverFetch<MeResponse>("/api/auth/me")
  const clearance = getClearanceInfo(user)
  const granted = clearance.access === "GRANTED"

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 p-4 font-mono text-neutral-300">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-950" />

      <HudPanel
        label="AETHER // ACCESS TERMINAL"
        className="relative w-full max-w-2xl shadow-[0_0_60px_-20px_rgba(245,158,11,0.25)] sm:p-2"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-4xl font-bold tracking-[0.3em] text-amber-500 sm:text-5xl">
            AETHER
          </h1>
          <p className="text-xs tracking-[0.2em] text-neutral-500 sm:text-sm">
            ECLIPSE PROTOCOL // SECURE ACCESS TERMINAL
          </p>
        </div>

        <div className="mt-10 space-y-3 text-sm">
          <TerminalField label="LOGIN" value={user?.username ?? "??????"} />
          <TerminalField label="PASSWORD" value="********" />
        </div>

        <div className="mt-8 space-y-2 border-t border-neutral-700/60 pt-6 text-sm">
          <p
            className={cn(
              "text-lg font-bold tracking-widest",
              granted ? "text-amber-500" : "text-red-500"
            )}
          >
            {granted ? "ACCESS GRANTED" : "ACCESS RESTRICTED"}
          </p>
          {clearance.greeting ? <p className="text-neutral-300">{clearance.greeting}</p> : null}
          {clearance.lines.map((line) => (
            <p
              key={line.text}
              className={line.tone === "warning" ? "text-amber-400" : "text-neutral-400"}
            >
              {line.text}
            </p>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          {user ? (
            <Link
              href="/wiki"
              className="border border-amber-500/40 px-6 py-2 text-sm tracking-widest text-amber-400 transition-colors hover:bg-amber-500/10"
            >
              [ PROCEED ]
            </Link>
          ) : (
            <a
              href={`${BACKEND_URL}/api/auth/discord/login`}
              className="border border-amber-500/40 px-6 py-2 text-sm tracking-widest text-amber-400 transition-colors hover:bg-amber-500/10"
            >
              [ AUTHENTICATE VIA DISCORD ]
            </a>
          )}
        </div>
      </HudPanel>
    </div>
  )
}
