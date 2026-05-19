"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { Pause, Play, Download, Search, ArrowDownToLine, Trash2, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { StoredWebhookEvent } from "@/lib/webhook-store"
import { useI18n } from "@/lib/i18n"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Filters {
  rooms: string[]
  participants: string[]
  eventTypes: string[]
}

const eventLevel = (event: string): "info" | "warn" | "error" => {
  if (event.includes("finished") || event.includes("left") || event.includes("aborted") || event.includes("deleted")) return "warn"
  if (event.includes("error") || event.includes("failed") || event.includes("disconnect")) return "error"
  return "info"
}

const levelStyles: Record<string, string> = {
  info: "text-chart-2",
  warn: "text-warning",
  error: "text-destructive",
}

export function LogsView() {
  const { t } = useI18n()
  const [logs, setLogs] = useState<StoredWebhookEvent[]>([])
  const [filters, setFilters] = useState<Filters>({ rooms: [], participants: [], eventTypes: [] })
  const [paused, setPaused] = useState(false)
  const [level, setLevel] = useState<string>("all")
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"raw" | "json">("raw")
  const [autoscroll, setAutoscroll] = useState(true)
  const [loading, setLoading] = useState(true)
  const [roomFilter, setRoomFilter] = useState("all")
  const [eventTypeFilter, setEventTypeFilter] = useState("all")
  const containerRef = useRef<HTMLDivElement>(null)
  const lastFetchRef = useRef<number>(0)

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.set("limit", "300")
      if (roomFilter !== "all") params.set("room", roomFilter)
      if (eventTypeFilter !== "all") params.set("type", eventTypeFilter)

      const res = await fetch(`/api/events?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.events || [])
        setFilters(data.filters || { rooms: [], participants: [], eventTypes: [] })
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    } finally {
      setLoading(false)
    }
  }, [roomFilter, eventTypeFilter])

  useEffect(() => {
    fetchLogs()
    return () => {}
  }, [fetchLogs])

  useEffect(() => {
    if (paused) return
    const id = setInterval(async () => {
      const now = Date.now()
      if (now - lastFetchRef.current < 2500) return
      lastFetchRef.current = now
      try {
        const params = new URLSearchParams()
        params.set("limit", "300")
        if (roomFilter !== "all") params.set("room", roomFilter)
        if (eventTypeFilter !== "all") params.set("type", eventTypeFilter)

        const res = await fetch(`/api/events?${params}`)
        if (res.ok) {
          const data = await res.json()
          setLogs(data.events || [])
          setFilters(data.filters || { rooms: [], participants: [], eventTypes: [] })
        }
      } catch (err) {
        console.error('Failed to fetch logs:', err)
      }
    }, 3000)
    return () => clearInterval(id)
  }, [paused, roomFilter, eventTypeFilter])

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const lvl = eventLevel(l.event)
      if (level !== "all" && lvl !== level) return false
      if (query && !`${l.event} ${l.room || ""} ${l.participant || ""}`.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [logs, level, query])

  useEffect(() => {
    if (autoscroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [filtered, autoscroll])

  function exportLogs(format: "json" | "csv") {
    const data = filtered.map((l) => ({
      timestamp: new Date(l.createdAt * 1000).toISOString(),
      level: eventLevel(l.event),
      event: l.event,
      room: l.room,
      participant: l.participant,
    }))

    let content: string
    let mimeType: string
    let extension: string

    if (format === "json") {
      content = JSON.stringify(data, null, 2)
      mimeType = "application/json"
      extension = "json"
    } else {
      const headers = "timestamp,level,event,room,participant"
      const rows = data.map((d) => `"${d.timestamp}","${d.level}","${d.event}","${d.room || ""}","${d.participant || ""}"`)
      content = [headers, ...rows].join("\n")
      mimeType = "text/csv"
      extension = "csv"
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `livekit-logs-${new Date().toISOString().slice(0, 10)}.${extension}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${filtered.length} logs as ${extension.toUpperCase()}`)
  }

  async function clearLogs() {
    try {
      const res = await fetch('/api/events', { method: 'DELETE' })
      if (res.ok) {
        setLogs([])
        toast.success("Logs cleared")
      }
    } catch (err) {
      toast.error("Failed to clear logs")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{t("logs.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("logs.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportLogs("json")}>
            <Download className="size-4" /> JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportLogs("csv")}>
            <Download className="size-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={clearLogs}>
            <Trash2 className="size-4" /> Clear
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
            <SelectItem value="info">info</SelectItem>
            <SelectItem value="warn">warn</SelectItem>
            <SelectItem value="error">error</SelectItem>
          </SelectContent>
        </Select>
        {filters.rooms.length > 0 && (
          <Select value={roomFilter} onValueChange={setRoomFilter}>
            <SelectTrigger className="w-40">
              <Filter className="size-4 me-1" />
              <SelectValue placeholder="All rooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All rooms</SelectItem>
              {filters.rooms.map((room) => (
                <SelectItem key={room} value={room}>{room}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {filters.eventTypes.length > 0 && (
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              {filters.eventTypes.slice(0, 20).map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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

      {/* Active filters */}
      {(roomFilter !== "all" || eventTypeFilter !== "all" || level !== "all" || query) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-muted-foreground">Active filters:</span>
          {roomFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent ring-1 ring-border">
              Room: {roomFilter}
              <button onClick={() => setRoomFilter("all")} className="hover:text-destructive"><X className="size-3" /></button>
            </span>
          )}
          {eventTypeFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent ring-1 ring-border">
              Event: {eventTypeFilter}
              <button onClick={() => setEventTypeFilter("all")} className="hover:text-destructive"><X className="size-3" /></button>
            </span>
          )}
          {level !== "all" && (
            <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full ring-1", levelStyles[level] || "text-foreground bg-accent ring-border")}>
              Level: {level}
              <button onClick={() => setLevel("all")} className="hover:text-destructive"><X className="size-3" /></button>
            </span>
          )}
          {query && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent ring-1 ring-border">
              Search: "{query}"
              <button onClick={() => setQuery("")} className="hover:text-destructive"><X className="size-3" /></button>
            </span>
          )}
          <button 
            onClick={() => { setRoomFilter("all"); setEventTypeFilter("all"); setLevel("all"); setQuery("") }}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}

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
          {loading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">Loading logs...</div>
          ) : filtered.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">No logs match current filters</div>
          ) : (
            filtered.map((l) => {
              const lvl = eventLevel(l.event)
              const ts = l.createdAt * 1000
              const time = isNaN(ts) ? "--:--:--" : new Date(ts).toISOString().split("T")[1]?.slice(0, 12) ?? "--:--:--"
              const source = l.room || l.participant || "system"
              return (
                <div key={l.id} className="flex gap-3 py-0.5 hover:bg-accent/30 px-2 rounded">
                  <span className="text-muted-foreground shrink-0 tabular-nums">{time}</span>
                  <span className={cn("shrink-0 w-14 uppercase font-semibold", levelStyles[lvl])}>{lvl}</span>
                  <span className="text-chart-1 shrink-0">[{source}]</span>
                  {view === "raw" ? (
                    <span className="text-foreground truncate">{l.event}{l.room ? ` — ${l.room}` : ""}</span>
                  ) : (
                    <span className="text-muted-foreground truncate">
                      {JSON.stringify({ event: l.event, room: l.room, participant: l.participant })}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
