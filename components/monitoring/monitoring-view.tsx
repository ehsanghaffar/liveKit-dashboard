"use client"

import { useEffect, useState } from "react"
import { Cpu, MemoryStick, HardDrive, Network, Activity } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { MetricChart } from "@/components/dashboard/metric-chart"
import { useI18n } from "@/lib/i18n"
import { Progress } from "@/components/ui/progress"

export function MonitoringView() {
  const { t } = useI18n()
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 2000)
    return () => clearInterval(id)
  }, [])

  const cpu = 38 + ((tick * 5) % 19) - 9
  const ram = 56 + ((tick * 3) % 11) - 5
  const disk = 41
  const net = 62 + ((tick * 7) % 14) - 7

  const nodes = [
    { id: "lk-1", region: "us-east-1", cpu: cpu, ram: ram, peers: 184 },
    { id: "lk-2", region: "eu-west-1", cpu: Math.max(5, cpu - 12), ram: Math.max(20, ram - 8), peers: 142 },
    { id: "lk-3", region: "ap-southeast-1", cpu: Math.min(95, cpu + 9), ram: Math.min(95, ram + 4), peers: 161 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{t("monitoring.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("monitoring.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label={t("monitoring.cpu")} value={`${cpu}%`} icon={Cpu} accent="primary" trend={2.1} />
        <StatsCard label={t("monitoring.ram")} value={`${ram}%`} icon={MemoryStick} accent="blue" trend={-0.4} />
        <StatsCard label={t("monitoring.disk")} value={`${disk}%`} icon={HardDrive} accent="default" hint="412 GB / 1 TB" />
        <StatsCard label={t("monitoring.network")} value={`${net}%`} icon={Network} accent="amber" trend={5.6} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricChart title={t("monitoring.cpu") + " & " + t("monitoring.ram")} series="cpuRam" height={260} />
        <MetricChart title={t("monitoring.network")} series="traffic" height={260} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card ring-1 ring-border p-5">
          <h3 className="text-sm font-semibold mb-1">{t("monitoring.webrtc")}</h3>
          <p className="text-xs text-muted-foreground mb-4">Aggregate transport metrics</p>
          <div className="space-y-4">
            {[
              { l: t("monitoring.packetLoss"), v: "0.4%", p: 4, hint: "Healthy" },
              { l: t("monitoring.jitter"), v: "8.2 ms", p: 16, hint: "Excellent" },
              { l: t("monitoring.rtt"), v: "42 ms", p: 28, hint: "Good" },
              { l: t("monitoring.transports"), v: "318", p: 64, hint: "63% capacity" },
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
          <h3 className="text-sm font-semibold mb-1">Cluster nodes</h3>
          <p className="text-xs text-muted-foreground mb-4">Per-node resource utilization</p>
          <div className="space-y-3">
            {nodes.map((n) => (
              <div key={n.id} className="rounded-xl bg-accent/30 ring-1 ring-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/15 ring-1 ring-primary/20 grid place-items-center">
                      <Activity className="size-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold font-mono">{n.id}</div>
                      <div className="text-[11px] text-muted-foreground">{n.region} • {n.peers} peers</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-success bg-success/10 ring-1 ring-success/20 px-2 py-0.5 rounded-full">
                    <span className="size-1.5 rounded-full bg-success animate-pulse-dot" />
                    HEALTHY
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">CPU</span><span className="font-mono tabular-nums">{n.cpu}%</span></div>
                    <Progress value={n.cpu} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">RAM</span><span className="font-mono tabular-nums">{n.ram}%</span></div>
                    <Progress value={n.ram} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Net</span><span className="font-mono tabular-nums">{Math.round(n.peers / 3.5)}%</span></div>
                    <Progress value={Math.round(n.peers / 3.5)} className="h-1.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
