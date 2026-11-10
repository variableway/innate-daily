"use client"

import * as React from "react"

import { cn } from "../../lib/utils"

export function Kbd({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 min-w-5 select-none items-center justify-center rounded border bg-muted px-1 font-mono text-[11px] text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
