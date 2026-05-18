"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Mic, MicOff, Video, VideoOff, MoreHorizontal, MessageSquare, UserMinus, Disc, Wifi, Globe2, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { MetricChart } from "@/components/dashboard/metric-chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { generateParticipants, formatBytes, formatDuration, type Participant } from "@/lib/mock-data"
import { useI18n } from "@/lib/i18n"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const initials = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()

const qualityVariant = (q: Participant["quality"]) => (q === "excellent" ? "live" : q === "good" ? "info" : "ending")

export function RoomDetailView({ roomId }: { roomId: string }) {
  const { t } = useI18n()
  const [participants] = useState(() => generateParticipants(12))

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/rooms" className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="size-3" /> {t("nav.rooms")}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-mono">{roomId}</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl bg-card ring-1 ring-border p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight truncate">webinar-product-launch</h1>
              <StatusBadge variant="live" pulse>{t("common.live")}</StatusBadge>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-destructive bg-destructive/10 ring-1 ring-destructive/20 px-2 py-0.5 rounded-md">
                <Disc className="size-2.5 animate-pulse-dot" /> RECORDING
              </span>
            </div>
            <div className="text-xs font-mono text-muted-foreground">{roomId}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">{t("rooms.invite")}</Button>
            <Button variant="outline" size="sm">{t("rooms.copyId")}</Button>
            <Button variant="destructive" size="sm">{t("rooms.disconnect")}</Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { l: t("rooms.participants"), v: "12 / 500" },
            { l: t("common.region"), v: "us-east-1" },
            { l: t("rooms.codec"), v: "VP9" },
            { l: t("rooms.bitrate"), v: "2.4 Mbps" },
            { l: t("common.duration"), v: formatDuration(3842) },
            { l: t("dashboard.transports"), v: "24" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl bg-accent/40 ring-1 ring-border p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
              <div className="mt-1 text-sm font-semibold tabular-nums">{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="participants">
        <TabsList className="bg-card ring-1 ring-border">
          <TabsTrigger value="participants">{t("room.tabs.participants")}</TabsTrigger>
          <TabsTrigger value="tracks">{t("room.tabs.tracks")}</TabsTrigger>
          <TabsTrigger value="events">{t("room.tabs.events")}</TabsTrigger>
          <TabsTrigger value="stats">{t("room.tabs.stats")}</TabsTrigger>
          <TabsTrigger value="logs">{t("room.tabs.logs")}</TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {participants.map((p) => (
              <div key={p.id} className="rounded-2xl bg-card ring-1 ring-border p-4 hover:ring-ring/30 transition">
                <div className="flex items-start gap-3">
                  <Avatar className="size-10 ring-1 ring-border">
                    <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">{initials(p.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold truncate">{p.name}</div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.role}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate">{p.identity}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7 -me-1">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast(`Muted ${p.name}`)}>
                        <MicOff className="size-4" /> {t("room.mute")}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <VideoOff className="size-4" /> {t("room.disableCam")}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="size-4" /> {t("room.message")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <UserMinus className="size-4" /> {t("room.remove")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3 flex items-center gap-1.5">
                  <span className={cn("inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md ring-1", p.audio ? "text-success bg-success/10 ring-success/20" : "text-muted-foreground bg-muted ring-border")}>
                    {p.audio ? <Mic className="size-3" /> : <MicOff className="size-3" />} audio
                  </span>
                  <span className={cn("inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md ring-1", p.video ? "text-success bg-success/10 ring-success/20" : "text-muted-foreground bg-muted ring-border")}>
                    {p.video ? <Video className="size-3" /> : <VideoOff className="size-3" />} video
                  </span>
                  {p.screen && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md ring-1 text-chart-2 bg-chart-2/10 ring-chart-2/20">
                      <Monitor className="size-3" /> screen
                    </span>
                  )}
                  <StatusBadge variant={qualityVariant(p.quality)} className="ms-auto">{p.quality}</StatusBadge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="rounded-lg bg-accent/40 ring-1 ring-border px-2 py-1.5">
                    <div className="text-muted-foreground">bitrate</div>
                    <div className="text-foreground tabular-nums">{formatBytes(p.bitrateKbps)}</div>
                  </div>
                  <div className="rounded-lg bg-accent/40 ring-1 ring-border px-2 py-1.5">
                    <div className="text-muted-foreground">ping</div>
                    <div className="text-foreground tabular-nums">{p.pingMs}ms</div>
                  </div>
                  <div className="rounded-lg bg-accent/40 ring-1 ring-border px-2 py-1.5">
                    <div className="text-muted-foreground">loss</div>
                    <div className="text-foreground tabular-nums">{p.packetLoss}%</div>
                  </div>
                  <div className="rounded-lg bg-accent/40 ring-1 ring-border px-2 py-1.5 truncate">
                    <div className="text-muted-foreground">device</div>
                    <div className="text-foreground truncate">{p.device}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Globe2 className="size-3" /> {p.region}</span>
                  <span className="inline-flex items-center gap-1"><Wifi className="size-3" /> {p.browser}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tracks" className="mt-4">
          <div className="rounded-2xl bg-card ring-1 ring-border p-6 text-center text-sm text-muted-foreground">
            Track inspector — {participants.length * 2} active media tracks across this room.
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-4 space-y-2">
          {[
            { ts: "12:48:21", t: "participant_joined", who: "Sara Ahmadi" },
            { ts: "12:47:02", t: "track_published", who: "Liam Chen" },
            { ts: "12:45:18", t: "recording_started", who: "system" },
            { ts: "12:44:01", t: "room_created", who: "system" },
          ].map((e, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-card ring-1 ring-border px-4 py-2.5 text-sm">
              <span className="font-mono text-xs text-muted-foreground">{e.ts}</span>
              <span className="font-medium">{e.t}</span>
              <span className="text-muted-foreground ms-auto text-xs">{e.who}</span>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="stats" className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MetricChart title="Bitrate (kbps)" series="single" height={240} />
          <MetricChart title="Participants" series="participants" height={240} />
          <MetricChart title="Packet loss" series="traffic" height={200} />
          <MetricChart title="CPU / RAM" series="cpuRam" height={200} />
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <div className="rounded-2xl bg-card ring-1 ring-border p-4 font-mono text-xs space-y-1 max-h-[400px] overflow-auto scrollbar-thin">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="flex gap-3 py-0.5">
                <span className="text-muted-foreground">12:{(48 - i).toString().padStart(2, "0")}:21</span>
                <span className="text-chart-2">INFO</span>
                <span className="text-foreground">livekit: track published video/h264 1080p — peer_{i}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
