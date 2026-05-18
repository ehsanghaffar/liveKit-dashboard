"use client"

import Link from "next/link"
import { Activity, Cpu, MemoryStick, Network, Users, Radio, Clock4, Globe2, Plug } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { MetricChart } from "@/components/dashboard/metric-chart"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { useRooms } from "@/hooks/useRooms"
import { useConfig } from "@/hooks/useConfig"
import { formatDuration } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

export function DashboardView() {
  const { t } = useI18n()
  const { rooms } = useRooms()
  const { config } = useConfig()

  // Calculate real stats from rooms
  const activeRoomsCount = rooms.filter((r) => r.status === "live").length
  const liveParticipants = rooms.reduce((sum, r) => sum + r.participants, 0)
  const bandwidth = (rooms.reduce((sum, r) => sum + r.bitrate, 0) / 1000).toFixed(1) // convert kbps to Gbps
  const cpu = Math.min(100, Math.round((liveParticipants / 500) * 100)) // rough estimate

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-balance">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge variant="live" pulse>
            {t("common.live")}
          </StatusBadge>
          <span className="text-xs text-muted-foreground font-mono">3 nodes • us-east-1</span>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label={t("dashboard.activeRooms")} value={activeRoomsCount} icon={Radio} accent="primary" trend={4.2} />
        <StatsCard label={t("dashboard.participants")} value={liveParticipants} icon={Users} accent="blue" trend={2.1} />
        <StatsCard label={t("dashboard.bandwidth")} value={`${bandwidth} Gbps`} icon={Network} accent="amber" trend={-1.4} />
        <StatsCard label={t("dashboard.cpu")} value={`${cpu}%`} icon={Cpu} accent="primary" trend={0.6} hint="across 3 nodes" />
        <StatsCard label={t("dashboard.ram")} value="58%" icon={MemoryStick} accent="blue" trend={1.2} hint="9.3 / 16 GB" />
        <StatsCard label={t("dashboard.streams")} value="142" icon={Activity} accent="primary" trend={8.4} />
        <StatsCard label={t("dashboard.uptime")} value="12d 4h" icon={Clock4} accent="default" hint="since last restart" />
        <StatsCard label={t("dashboard.transports")} value="318" icon={Plug} accent="amber" trend={-0.3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MetricChart title={t("dashboard.participantsChart")} description="Realtime peers across all rooms" series="participants" className="lg:col-span-2" height={260} />
        <MetricChart title={t("dashboard.cpuRamChart")} description="Cluster average" series="cpuRam" height={260} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MetricChart title={t("dashboard.trafficChart")} description="Inbound + outbound" series="traffic" height={220} />

        {/* LiveKit configuration */}
        <div className="rounded-2xl bg-card ring-1 ring-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">{t("dashboard.nodeHealth")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">LiveKit configuration</p>
            </div>
            <Link href="/settings" className="text-xs text-primary hover:underline">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="rounded-xl bg-accent/40 ring-1 ring-border p-4">
              <div className="font-semibold">Server URL</div>
              <div className="text-xs">{config?.url ?? "Not configured"}</div>
            </div>
            <div className="rounded-xl bg-accent/40 ring-1 ring-border p-4">
              <div className="font-semibold">API Key</div>
              <div className="text-xs">{config?.hasApiKey ? "Configured" : "Missing"}</div>
            </div>
            <div className="rounded-xl bg-accent/40 ring-1 ring-border p-4">
              <div className="font-semibold">API Secret</div>
              <div className="text-xs">{config?.hasApiSecret ? "Configured" : "Missing"}</div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl bg-card ring-1 ring-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">{t("dashboard.activity")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Recent room events</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/rooms">
                {t("common.viewAll")} <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <ul className="space-y-1.5">
            {rooms.map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-accent/60 transition">
                <div className="size-7 rounded-lg bg-primary/10 ring-1 ring-primary/20 grid place-items-center">
                  <Globe2 className="size-3.5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {r.region} • {r.participants} peers • {formatDuration(r.durationSeconds)}
                  </div>
                </div>
                <StatusBadge variant={r.status === "live" ? "live" : r.status === "ending" ? "ending" : "idle"} pulse={r.status === "live"}>
                  {r.status}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
