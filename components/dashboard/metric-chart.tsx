"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

function generateTimeSeries(points = 60, base = 50, jitter = 20) {
  let v = base
  return Array.from({ length: points }).map((_, i) => {
    v = Math.max(0, Math.min(100, v + (Math.random() - 0.5) * jitter))
    return {
      t: i,
      label: `${points - i}m`,
      value: Math.round(v),
    }
  })
}

function generateMultiSeries(points = 60) {
  let cpu = 42, ram = 58, net = 35, participants = 80
  return Array.from({ length: points }).map((_, i) => {
    cpu = Math.max(5, Math.min(95, cpu + (Math.random() - 0.5) * 12))
    ram = Math.max(15, Math.min(92, ram + (Math.random() - 0.5) * 6))
    net = Math.max(0, Math.min(100, net + (Math.random() - 0.5) * 18))
    participants = Math.max(10, Math.min(320, participants + (Math.random() - 0.5) * 30))
    return {
      t: i,
      label: `${points - i}m`,
      cpu: Math.round(cpu),
      ram: Math.round(ram),
      net: Math.round(net),
      participants: Math.round(participants),
    }
  })
}

export function MetricChart({
  title,
  description,
  type = "area",
  series = "single",
  className,
  height = 220,
}: {
  title?: string
  description?: string
  type?: "area" | "line"
  series?: "single" | "cpuRam" | "participants" | "traffic"
  className?: string
  height?: number
}) {
  const [data, setData] = useState(() =>
    series === "single" ? generateTimeSeries(60, 50, 12) : generateMultiSeries(60),
  )

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const next = prev.slice(1)
        if (series === "single") {
          const last = (prev[prev.length - 1] as { value: number }).value
          const v = Math.max(0, Math.min(100, last + (Math.random() - 0.5) * 12))
          return [...next, { t: prev.length, label: "now", value: Math.round(v) }] as typeof prev
        }
        const last = prev[prev.length - 1] as { cpu: number; ram: number; net: number; participants: number }
        return [
          ...next,
          {
            t: prev.length,
            label: "now",
            cpu: Math.max(5, Math.min(95, last.cpu + (Math.random() - 0.5) * 10)),
            ram: Math.max(15, Math.min(92, last.ram + (Math.random() - 0.5) * 5)),
            net: Math.max(0, Math.min(100, last.net + (Math.random() - 0.5) * 18)),
            participants: Math.max(10, Math.min(320, last.participants + (Math.random() - 0.5) * 28)),
          },
        ] as typeof prev
      })
    }, 2000)
    return () => clearInterval(id)
  }, [series])

  const config: ChartConfig =
    series === "cpuRam"
      ? {
          cpu: { label: "CPU %", color: "var(--chart-1)" },
          ram: { label: "RAM %", color: "var(--chart-2)" },
        }
      : series === "participants"
        ? { participants: { label: "Participants", color: "var(--chart-1)" } }
        : series === "traffic"
          ? { net: { label: "Network %", color: "var(--chart-2)" } }
          : { value: { label: "Value", color: "var(--chart-1)" } }

  const gradId = `grad-${series}`

  const chart =
    type === "area" ? (
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`${gradId}-1`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`${gradId}-2`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={9} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={32} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {series === "cpuRam" ? (
          <>
            <Area type="monotone" dataKey="cpu" stroke="var(--chart-1)" strokeWidth={2} fill={`url(#${gradId}-1)`} />
            <Area type="monotone" dataKey="ram" stroke="var(--chart-2)" strokeWidth={2} fill={`url(#${gradId}-2)`} />
          </>
        ) : series === "participants" ? (
          <Area type="monotone" dataKey="participants" stroke="var(--chart-1)" strokeWidth={2} fill={`url(#${gradId}-1)`} />
        ) : series === "traffic" ? (
          <Area type="monotone" dataKey="net" stroke="var(--chart-2)" strokeWidth={2} fill={`url(#${gradId}-2)`} />
        ) : (
          <Area type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2} fill={`url(#${gradId}-1)`} />
        )}
      </AreaChart>
    ) : (
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={9} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={32} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
      </LineChart>
    )

  return (
    <div className={cn("rounded-2xl bg-card ring-1 ring-border p-5", className)}>
      {(title || description) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold tracking-tight">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-success bg-success/10 ring-1 ring-success/20 px-2 py-0.5 rounded-full">
            <span className="size-1.5 rounded-full bg-success animate-pulse-dot" />
            LIVE
          </span>
        </div>
      )}
      <ChartContainer config={config} className="!aspect-auto w-full" style={{ height }}>
        {chart}
      </ChartContainer>
    </div>
  )
}
