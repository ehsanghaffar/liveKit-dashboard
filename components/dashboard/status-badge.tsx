"use client"

import { cn } from "@/lib/utils"

type Variant = "live" | "idle" | "ending" | "healthy" | "degraded" | "down" | "neutral" | "info"

const styles: Record<Variant, { dot: string; chip: string; label?: string }> = {
  live: { dot: "bg-success", chip: "text-success bg-success/10 ring-success/20" },
  idle: { dot: "bg-muted-foreground", chip: "text-muted-foreground bg-muted ring-border" },
  ending: { dot: "bg-warning", chip: "text-warning bg-warning/10 ring-warning/20" },
  healthy: { dot: "bg-success", chip: "text-success bg-success/10 ring-success/20" },
  degraded: { dot: "bg-warning", chip: "text-warning bg-warning/10 ring-warning/20" },
  down: { dot: "bg-destructive", chip: "text-destructive bg-destructive/10 ring-destructive/20" },
  neutral: { dot: "bg-muted-foreground", chip: "text-muted-foreground bg-muted ring-border" },
  info: { dot: "bg-chart-2", chip: "text-chart-2 bg-chart-2/10 ring-chart-2/20" },
}

export function StatusBadge({
  variant = "neutral",
  children,
  pulse = false,
  className,
}: {
  variant?: Variant
  children: React.ReactNode
  pulse?: boolean
  className?: string
}) {
  const s = styles[variant]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 tabular-nums",
        s.chip,
        className,
      )}
    >
      <span className="relative inline-flex size-1.5">
        {pulse && <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping", s.dot)} />}
        <span className={cn("relative inline-flex size-1.5 rounded-full", s.dot)} />
      </span>
      {children}
    </span>
  )
}
