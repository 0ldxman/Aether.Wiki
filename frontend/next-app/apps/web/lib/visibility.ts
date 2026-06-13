import type { Visibility } from "@/lib/api/types"

export const VISIBILITY_META: Record<Visibility, { label: string; className: string }> = {
  public: { label: "PUBLIC", className: "text-neutral-400" },
  authenticated: { label: "ECHO+", className: "text-amber-400" },
  restricted: { label: "CLASSIFIED", className: "text-red-400" },
}
