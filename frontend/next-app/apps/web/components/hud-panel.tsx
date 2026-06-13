import { cn } from "@workspace/ui/lib/utils"

function HudCorners() {
  return (
    <>
      <span
        aria-hidden
        className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-amber-500"
      />
      <span
        aria-hidden
        className="absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-amber-500"
      />
      <span
        aria-hidden
        className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-amber-500"
      />
      <span
        aria-hidden
        className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-amber-500"
      />
    </>
  )
}

export function HudPanel({
  label,
  className,
  children,
}: {
  label?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("relative border border-neutral-700/80 bg-neutral-900/60", className)}>
      {label ? (
        <div className="border-b border-neutral-700/80 px-4 py-2 text-xs uppercase tracking-[0.25em] text-amber-500/70">
          {label}
        </div>
      ) : null}
      <div className="p-6">{children}</div>
      <HudCorners />
    </div>
  )
}
