"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Activity, Cpu, MemoryStick, Network, Users, Radio, Clock4, Zap, Globe2, Plug } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { MetricChart } from "@/components/dashboard/metric-chart"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { generateServices, generateRooms, formatDuration } from "@/lib/mock-data"
import { useI18n } from "@/lib/i18n"
import { ArrowRight } from "lucide-react"

export function DashboardView() {
  const { t } = useI18n()
  const [services] = useState(() => generateServices())
  const [rooms] = useState(() => generateRooms(6))
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 3000)
    return () => clearInterval(id)
  }, [])

  // gently animate live counts
  const liveParticipants = 487 + ((tick * 7) % 23) - 11
  const activeRooms = 24 + ((tick * 3) % 7) - 3
  const bandwidth = (3.2 + Math.sin(tick / 3) * 0.4).toFixed(1)
  const cpu = 38 + ((tick * 5) % 19) - 9

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
        <StatsCard label={t("dashboard.activeRooms")} value={activeRooms} icon={Radio} accent="primary" trend={4.2} />
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

        {/* Node health */}
        <div className="rounded-2xl bg-card ring-1 ring-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">{t("dashboard.nodeHealth")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Docker services</p>
            </div>
            <Link href="/settings" className="text-xs text-primary hover:underline">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="space-y-2">
            {services.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl bg-accent/40 ring-1 ring-border px-3 py-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 rounded-lg bg-card grid place-items-center ring-1 ring-border">
                    <Zap className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{s.version} • {s.uptime}</div>
                  </div>
                </div>
                <StatusBadge variant={s.status} pulse={s.status === "healthy"}>
                  {t(`common.${s.status}`)}
                </StatusBadge>
              </div>
            ))}
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
