"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

export type StatsCardProps = {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  trend?: number // percentage; positive = up
  accent?: "primary" | "blue" | "amber" | "rose" | "default"
  className?: string
}

const accents: Record<NonNullable<StatsCardProps["accent"]>, string> = {
  primary: "text-primary bg-primary/10 ring-primary/20",
  blue: "text-chart-2 bg-chart-2/10 ring-chart-2/20",
  amber: "text-warning bg-warning/10 ring-warning/20",
  rose: "text-destructive bg-destructive/10 ring-destructive/20",
  default: "text-foreground bg-accent ring-border",
}

export function StatsCard({ label, value, hint, icon: Icon, trend, accent = "primary", className }: StatsCardProps) {
  const up = (trend ?? 0) >= 0
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card ring-1 ring-border p-5",
        "hover:ring-ring/30 transition-all duration-200",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn("size-10 rounded-xl grid place-items-center ring-1 shrink-0", accents[accent])}>
            <Icon className="size-5" />
          </div>
        )}
      </div>
      {typeof trend === "number" && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-medium",
              up ? "text-success bg-success/10" : "text-destructive bg-destructive/10",
            )}
          >
            {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-muted-foreground">vs last hour</span>
        </div>
      )}
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}
