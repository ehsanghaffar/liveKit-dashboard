"use client"

import { useState } from "react"
import { ServerCog, Database, Globe2, Plug, RefreshCw, ScrollText, RotateCw, Heart, Webhook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { generateServices } from "@/lib/mock-data"
import { useI18n } from "@/lib/i18n"
import { toast } from "sonner"

const iconFor: Record<string, typeof ServerCog> = {
  livekit: ServerCog,
  redis: Database,
  turn: Globe2,
  api: Plug,
  ws: Plug,
  egress: RefreshCw,
}

export function SettingsView() {
  const { t } = useI18n()
  const [services] = useState(() => generateServices())
  const [maxParticipants, setMaxParticipants] = useState([500])
  const [maxBitrate, setMaxBitrate] = useState([5000])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      {/* Server management */}
      <div className="rounded-2xl bg-card ring-1 ring-border p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold">{t("server.title")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Docker container orchestration</p>
          </div>
          <Button variant="outline" size="sm">
            <Heart className="size-4" /> {t("server.health")}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((s) => {
            const Icon = iconFor[s.id] ?? ServerCog
            return (
              <div key={s.id} className="rounded-xl bg-accent/30 ring-1 ring-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-xl bg-primary/15 ring-1 ring-primary/20 grid place-items-center">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono truncate">{s.containerId}</div>
                    </div>
                  </div>
                  <StatusBadge variant={s.status} pulse={s.status === "healthy"}>
                    {t(`common.${s.status}`)}
                  </StatusBadge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="rounded-lg bg-card ring-1 ring-border px-2 py-1.5">
                    <div className="text-muted-foreground">version</div>
                    <div>{s.version}</div>
                  </div>
                  <div className="rounded-lg bg-card ring-1 ring-border px-2 py-1.5">
                    <div className="text-muted-foreground">uptime</div>
                    <div>{s.uptime}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-1">
                  <Button variant="outline" size="sm" onClick={() => toast.success(`Restarting ${s.name}…`)}>
                    <RotateCw className="size-3.5" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ScrollText className="size-3.5" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="size-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Configuration tabs */}
      <Tabs defaultValue="general">
        <TabsList className="bg-card ring-1 ring-border flex-wrap h-auto">
          <TabsTrigger value="general">{t("settings.general")}</TabsTrigger>
          <TabsTrigger value="turn">{t("settings.turn")}</TabsTrigger>
          <TabsTrigger value="api">{t("settings.api")}</TabsTrigger>
          <TabsTrigger value="security">{t("settings.security")}</TabsTrigger>
          <TabsTrigger value="limits">{t("settings.limits")}</TabsTrigger>
          <TabsTrigger value="recording">{t("settings.recording")}</TabsTrigger>
          <TabsTrigger value="webhooks">{t("settings.webhooks")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <SettingsCard title="Cluster">
            <Field label="Cluster name" defaultValue="livekit-prod-eu" />
            <Field label="Public hostname" defaultValue="rtc.example.com" mono />
            <Field label="Region" defaultValue="us-east-1" />
            <ToggleField label="Auto-scaling" desc="Scale workers based on participant load" defaultChecked />
          </SettingsCard>
        </TabsContent>

        <TabsContent value="turn" className="mt-4">
          <SettingsCard title="TURN / STUN">
            <Field label="TURN host" defaultValue="turn.example.com" mono />
            <Field label="TURN port" defaultValue="3478" mono />
            <Field label="TLS port" defaultValue="5349" mono />
            <Field label="Shared secret" defaultValue="••••••••••••••••" mono type="password" />
            <ToggleField label="Use TLS" defaultChecked />
          </SettingsCard>
        </TabsContent>

        <TabsContent value="api" className="mt-4">
          <SettingsCard title="API Keys">
            <Field label="API key" defaultValue="APIabc123def456ghi" mono />
            <Field label="API secret" defaultValue="••••••••••••••••••••••••" mono type="password" />
            <Field label="Webhook URL" defaultValue="https://api.example.com/livekit/webhook" mono />
          </SettingsCard>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <SettingsCard title="Security">
            <ToggleField label="Require authentication" desc="Reject unauthenticated room joins" defaultChecked />
            <ToggleField label="Rate limit token issuance" defaultChecked />
            <ToggleField label="Strict origin validation" />
            <Field label="Allowed origins" defaultValue="https://app.example.com, https://admin.example.com" mono />
          </SettingsCard>
        </TabsContent>

        <TabsContent value="limits" className="mt-4">
          <SettingsCard title="Limits">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Max participants per room</Label>
                <span className="text-sm font-mono tabular-nums">{maxParticipants[0]}</span>
              </div>
              <Slider value={maxParticipants} onValueChange={setMaxParticipants} min={10} max={1000} step={10} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Max bitrate (kbps)</Label>
                <span className="text-sm font-mono tabular-nums">{maxBitrate[0]}</span>
              </div>
              <Slider value={maxBitrate} onValueChange={setMaxBitrate} min={500} max={10000} step={100} />
            </div>
            <Field label="Max room duration (hours)" defaultValue="24" mono />
          </SettingsCard>
        </TabsContent>

        <TabsContent value="recording" className="mt-4">
          <SettingsCard title="Recording / Egress">
            <ToggleField label="Enable recording" defaultChecked />
            <Field label="S3 bucket" defaultValue="livekit-recordings" mono />
            <Field label="S3 region" defaultValue="us-east-1" mono />
            <Field label="Output format" defaultValue="mp4 (H.264 + AAC)" />
          </SettingsCard>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          <SettingsCard title="Webhooks">
            <div className="rounded-xl bg-accent/30 ring-1 ring-border p-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-primary/15 ring-1 ring-primary/20 grid place-items-center">
                  <Webhook className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">Production webhook</div>
                  <div className="text-[11px] text-muted-foreground font-mono truncate">https://api.example.com/livekit/webhook</div>
                </div>
                <StatusBadge variant="healthy" pulse>active</StatusBadge>
              </div>
            </div>
            <Button variant="outline" size="sm">+ Add webhook</Button>
          </SettingsCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border p-6">
      <h3 className="text-base font-semibold mb-5">{title}</h3>
      <div className="space-y-4 max-w-2xl">{children}</div>
      <div className="flex items-center justify-end gap-2 pt-6 mt-6 border-t border-border">
        <Button variant="ghost">Cancel</Button>
        <Button onClick={() => toast.success("Saved")}>Save changes</Button>
      </div>
    </div>
  )
}

function Field({ label, defaultValue, mono, type = "text" }: { label: string; defaultValue?: string; mono?: boolean; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Input defaultValue={defaultValue} type={type} className={mono ? "font-mono text-xs" : undefined} />
    </div>
  )
}

function ToggleField({ label, desc, defaultChecked }: { label: string; desc?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-accent/30 ring-1 ring-border px-4 py-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}
