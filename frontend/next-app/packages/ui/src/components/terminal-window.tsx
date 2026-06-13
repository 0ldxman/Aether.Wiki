import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

function TerminalWindowCorners() {
  return (
    <>
      <span
        aria-hidden
        className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-primary"
      />
      <span
        aria-hidden
        className="absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-primary"
      />
      <span
        aria-hidden
        className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-primary"
      />
      <span
        aria-hidden
        className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-primary"
      />
    </>
  )
}

function TerminalWindow({
  title,
  className,
  contentClassName,
  corners = true,
  children,
}: {
  title?: React.ReactNode
  className?: string
  contentClassName?: string
  corners?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn("relative border border-border bg-card", className)}>
      {title ? (
        <div className="flex items-stretch border-b border-border">
          <div className="whitespace-nowrap border-r border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-primary/80">
            {title}
          </div>
          <div aria-hidden className="flex-1" />
        </div>
      ) : null}
      <div className={cn("p-6", contentClassName)}>{children}</div>
      {corners ? <TerminalWindowCorners /> : null}
    </div>
  )
}

export { TerminalWindow }
