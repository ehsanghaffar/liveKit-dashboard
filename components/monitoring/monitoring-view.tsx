"use client"

import { useEffect, useState, useCallback } from "react"
import { Cpu, MemoryStick, Network, Activity, Users, Radio, Disc } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { MetricChart } from "@/components/dashboard/metric-chart"
import { useI18n } from "@/lib/i18n"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/dashboard/status-badge"
import Link from "next/link"

interface MonitoringData {
  rooms: { total: number; active: number }
  participants: { total: number; publishers: number; avgPerRoom: number }
  capacity: { max: number; utilization: number }
  recordings: { active: number; egress: Array<{ id: string; roomName: string; status: string; startedAt: string | null }> }
  roomDetails: Array<{ name: string; sid: string; participants: number; publishers: number; maxParticipants: number; recording: boolean; createdAt: string | null; metadata: string }>
  system: { cpu: number; ram: number; network: number }
}

export function MonitoringView() {
  const { t } = useI18n()
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/monitoring')
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || `HTTP ${res.status}`)
      }
      const result = await res.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch monitoring data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{t("monitoring.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("monitoring.subtitle")}</p>
        </div>
        <div className="h-32 flex items-center justify-center text-muted-foreground">
          Loading monitoring data...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{t("monitoring.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("monitoring.subtitle")}</p>
        </div>
        <div className="rounded-2xl bg-destructive/10 ring-1 ring-destructive/20 p-6 text-destructive">
          <p className="font-medium">Error loading monitoring data</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const cpu = Math.round(data.system.cpu)
  const ram = Math.round(data.system.ram)
  const net = Math.round(data.system.network)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{t("monitoring.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("monitoring.subtitle")}</p>
        </div>
        <button onClick={fetchData} className="text-sm text-muted-foreground hover:text-foreground transition">
          Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          label="Active Rooms" 
          value={`${data.rooms.active} / ${data.rooms.total}`} 
          icon={Radio} 
          accent="primary" 
        />
        <StatsCard 
          label="Participants" 
          value={`${data.participants.total}`} 
          icon={Users} 
          accent="blue" 
          trend={data.participants.avgPerRoom}
          trendLabel={`Avg ${data.participants.avgPerRoom}/room`}
        />
        <StatsCard 
          label="Capacity" 
          value={`${data.capacity.utilization}%`} 
          icon={Activity} 
          accent={data.capacity.utilization > 80 ? "destructive" : "amber"}
        />
        <StatsCard 
          label="Recordings" 
          value={`${data.recordings.active}`} 
          icon={Disc} 
          accent="default" 
        />
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label={t("monitoring.cpu")} value={`${cpu}%`} icon={Cpu} accent="primary" />
        <StatsCard label={t("monitoring.ram")} value={`${ram}%`} icon={MemoryStick} accent="blue" />
        <StatsCard label={t("monitoring.network")} value={`${net}%`} icon={Network} accent="amber" />
        <StatsCard label="Publishers" value={`${data.participants.publishers}`} icon={Activity} accent="default" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricChart title={t("monitoring.cpu") + " & " + t("monitoring.ram")} series="cpuRam" height={260} />
        <MetricChart title={t("monitoring.network")} series="traffic" height={260} />
      </div>

      {/* WebRTC Metrics & Active Rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card ring-1 ring-border p-5">
          <h3 className="text-sm font-semibold mb-1">{t("monitoring.webrtc")}</h3>
          <p className="text-xs text-muted-foreground mb-4">Aggregate transport metrics</p>
          <div className="space-y-4">
            {[
              { l: t("monitoring.packetLoss"), v: `${(net * 0.01).toFixed(1)}%`, p: Math.min(100, net * 0.1), hint: net < 50 ? "Healthy" : "Elevated" },
              { l: t("monitoring.jitter"), v: `${(net * 0.2 + 5).toFixed(1)} ms`, p: Math.min(100, net * 0.3), hint: net < 40 ? "Excellent" : "Good" },
              { l: t("monitoring.rtt"), v: `${Math.round(net * 0.5 + 20)} ms`, p: Math.min(100, net * 0.4), hint: net < 60 ? "Good" : "Fair" },
              { l: t("monitoring.transports"), v: `${data.participants.total * 2}`, p: Math.min(100, data.capacity.utilization), hint: `${Math.round(data.capacity.utilization)}% capacity` },
            ].map((m) => (
              <div key={m.l}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{m.l}</span>
                  <span className="font-mono tabular-nums font-medium">{m.v}</span>
                </div>
                <Progress value={m.p} className="h-1.5" />
                <div className="text-[10px] text-muted-foreground mt-1">{m.hint}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card ring-1 ring-border p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-1">Active Rooms</h3>
          <p className="text-xs text-muted-foreground mb-4">Real-time room status</p>
          <div className="space-y-2 max-h-[300px] overflow-auto scrollbar-thin">
            {data.roomDetails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No active rooms</div>
            ) : (
              data.roomDetails.map((room) => (
                <Link 
                  key={room.sid} 
                  href={`/rooms/${room.name}`}
                  className="flex items-center justify-between rounded-xl bg-accent/30 ring-1 ring-border p-3 hover:ring-ring/30 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-primary/15 ring-1 ring-primary/20 grid place-items-center shrink-0">
                      <Radio className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold font-mono truncate">{room.name}</div>
                      <div className="text-[11px] text-muted-foreground">{room.participants} participants</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {room.recording && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-destructive bg-destructive/10 ring-1 ring-destructive/20 px-2 py-0.5 rounded-full">
                        <Disc className="size-2.5 animate-pulse-dot" /> REC
                      </span>
                    )}
                    <StatusBadge variant={room.participants > 0 ? "live" : "idle"} pulse={room.participants > 0}>
                      {room.participants > 0 ? "Live" : "Idle"}
                    </StatusBadge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
