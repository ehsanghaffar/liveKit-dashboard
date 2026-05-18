"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Pause, Play, Download, Search, ArrowDownToLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { type LogEntry, type LogLevel } from "@/lib/mock-data"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const levelStyles: Record<LogLevel, string> = {
  debug: "text-muted-foreground",
  info: "text-chart-2",
  warn: "text-warning",
  error: "text-destructive",
}

export function LogsView() {
  const { t } = useI18n()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [paused, setPaused] = useState(false)
  const [level, setLevel] = useState<"all" | LogLevel>("all")
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"raw" | "json">("raw")
  const [autoscroll, setAutoscroll] = useState(true)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch webhook events from API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/events?limit=300')
        if (res.ok) {
          const data = await res.json()
          setLogs(data.events || [])
        }
      } catch (err) {
        console.error('Failed to fetch logs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  // Poll for new webhook events
  useEffect(() => {
    if (paused) return
    const id = setInterval(async () => {
      try {
        const res = await fetch('/api/events?limit=300')
        if (res.ok) {
          const data = await res.json()
          setLogs(data.events || [])
        }
      } catch (err) {
        console.error('Failed to fetch logs:', err)
      }
    }, 3000)
    return () => clearInterval(id)
  }, [paused])

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (level !== "all" && l.level !== level) return false
      if (query && !`${l.service} ${l.message}`.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [logs, level, query])

  useEffect(() => {
    if (autoscroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [filtered, autoscroll])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{t("logs.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("logs.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="size-4" /> {t("logs.download")}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl bg-card ring-1 ring-border p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="size-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("common.search")} className="ps-9 font-mono" />
        </div>
        <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t("logs.level")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="debug">debug</SelectItem>
            <SelectItem value="info">info</SelectItem>
            <SelectItem value="warn">warn</SelectItem>
            <SelectItem value="error">error</SelectItem>
          </SelectContent>
        </Select>
        <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as "raw" | "json")} variant="outline" size="sm">
          <ToggleGroupItem value="raw">{t("logs.raw")}</ToggleGroupItem>
          <ToggleGroupItem value="json">{t("logs.json")}</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-center gap-2 ms-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowDownToLine className="size-3.5" />
            {t("logs.autoscroll")}
            <Switch checked={autoscroll} onCheckedChange={setAutoscroll} />
          </div>
          <Button size="sm" variant={paused ? "default" : "outline"} onClick={() => setPaused((p) => !p)}>
            {paused ? <><Play className="size-4" /> {t("logs.resume")}</> : <><Pause className="size-4" /> {t("logs.pause")}</>}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-background/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive/70" />
            <span className="size-2.5 rounded-full bg-warning/70" />
            <span className="size-2.5 rounded-full bg-success/70" />
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">livekit-server.log — streaming {paused ? "paused" : "live"}</span>
          <span className="ms-auto text-[11px] font-mono text-muted-foreground">{filtered.length} lines</span>
        </div>
        <div ref={containerRef} className="font-mono text-xs h-[520px] overflow-auto scrollbar-thin p-4 space-y-0.5 bg-background/40">
          {filtered.map((l) => (
            <div key={l.id} className="flex gap-3 py-0.5 hover:bg-accent/30 px-2 rounded">
              <span className="text-muted-foreground shrink-0 tabular-nums">
                {new Date(l.ts).toISOString().split("T")[1].slice(0, 12)}
              </span>
              <span className={cn("shrink-0 w-12 uppercase font-semibold", levelStyles[l.level])}>{l.level}</span>
              <span className="text-chart-1 shrink-0">[{l.service}]</span>
              {view === "raw" ? (
                <span className="text-foreground truncate">{l.message}</span>
              ) : (
                <span className="text-muted-foreground truncate">
                  {JSON.stringify({ msg: l.message, ...l.meta })}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
