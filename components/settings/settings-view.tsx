"use client"

import { useState } from "react"
import { ServerCog, Database, Globe2, Plug, RefreshCw, ScrollText, RotateCw, Heart, Webhook, CheckCircle2, XCircle, AlertCircle, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { useConfig } from "@/hooks/useConfig"
import { useI18n } from "@/lib/i18n"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SettingsView() {
  const { t } = useI18n()
  const { config, loading, error, refetch } = useConfig()
  const [maxParticipants, setMaxParticipants] = useState([500])
  const [maxBitrate, setMaxBitrate] = useState([5000])
  const [testingConnection, setTestingConnection] = useState(false)

  async function testConnection() {
    setTestingConnection(true)
    try {
      await refetch()
      if (config?.connectionStatus === "connected") {
        toast.success(`Connected to LiveKit! Found ${config.roomCount} rooms.`)
      } else if (config?.connectionStatus === "error") {
        toast.error(`Connection failed: ${config.error}`)
      }
    } catch {
      toast.error("Failed to test connection")
    } finally {
      setTestingConnection(false)
    }
  }

  const connectionStatusConfig = {
    connected: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", ring: "ring-success/20", label: "Connected" },
    error: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", ring: "ring-destructive/20", label: "Connection Error" },
    not_configured: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10", ring: "ring-warning/20", label: "Not Configured" },
    unknown: { icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted", ring: "ring-border", label: "Unknown" },
  }

  const statusInfo = connectionStatusConfig[config?.connectionStatus || "unknown"]
  const StatusIcon = statusInfo.icon

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{t("settings.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("settings.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="size-4" /> Refresh
        </Button>
      </div>

      {/* Server management */}
      <div className="rounded-2xl bg-card ring-1 ring-border p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold">{t("server.title") || "Server Connection"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">LiveKit server status and configuration</p>
          </div>
          <Button variant="outline" size="sm" onClick={testConnection} disabled={testingConnection || loading}>
            {testingConnection ? <RotateCw className="size-4 animate-spin" /> : <Heart className="size-4" />}
            {testingConnection ? "Testing..." : "Test Connection"}
          </Button>
        </div>

        <div className="space-y-3">
          {error && (
            <div className="p-4 bg-destructive/10 ring-1 ring-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}
          {loading && (
            <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              Loading configuration…
            </div>
          )}
          {config && (
            <div className="rounded-xl bg-accent/30 ring-1 ring-border p-4">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("size-10 rounded-xl ring-1 grid place-items-center", statusInfo.bg, statusInfo.ring)}>
                    <StatusIcon className={cn("size-5", statusInfo.color)} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{statusInfo.label}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{config.url || "No URL configured"}</div>
                  </div>
                </div>
                <StatusBadge variant={config.connectionStatus === "connected" ? "healthy" : "degraded"} pulse={config.connectionStatus === "connected"}>
                  {config.connectionStatus === "connected" ? "Healthy" : "Unhealthy"}
                </StatusBadge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="rounded-lg bg-background/50 ring-1 ring-border p-2.5">
                  <div className="text-muted-foreground">URL</div>
                  <div className="font-mono truncate mt-0.5">{config.url || "—"}</div>
                </div>
                <div className="rounded-lg bg-background/50 ring-1 ring-border p-2.5">
                  <div className="text-muted-foreground">Region</div>
                  <div className="font-mono mt-0.5">{config.region}</div>
                </div>
                <div className="rounded-lg bg-background/50 ring-1 ring-border p-2.5">
                  <div className="text-muted-foreground">API Key</div>
                  <div className="font-mono mt-0.5">{config.hasApiKey ? "✓ Set" : "✗ Missing"}</div>
                </div>
                <div className="rounded-lg bg-background/50 ring-1 ring-border p-2.5">
                  <div className="text-muted-foreground">Active Rooms</div>
                  <div className="font-mono mt-0.5">{config.roomCount ?? "—"}</div>
                </div>
              </div>
            </div>
          )}
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
            <Field label="Region" defaultValue={config?.region || "auto"} />
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
            <div className="rounded-xl bg-accent/30 ring-1 ring-border p-4 mb-4">
              <div className="flex items-center gap-3">
                <Plug className="size-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">Current Configuration</div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    LIVEKIT_URL={config?.url || "not set"}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    LIVEKIT_API_KEY={config?.hasApiKey ? "****" : "not set"}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    LIVEKIT_API_SECRET={config?.hasApiSecret ? "****" : "not set"}
                  </div>
                </div>
              </div>
            </div>
            <Field label="Webhook URL" defaultValue={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/livekit`} mono />
            <Button variant="outline" size="sm" className="mt-2" onClick={() => {
              navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/livekit`)
              toast.success("Webhook URL copied")
            }}>
              <Copy className="size-4 me-1" /> Copy Webhook URL
            </Button>
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
                  <div className="text-[11px] text-muted-foreground font-mono truncate">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/livekit
                  </div>
                </div>
                <StatusBadge variant="healthy" pulse>active</StatusBadge>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              <p>Configure this URL in your LiveKit Cloud dashboard or self-hosted server configuration.</p>
              <p className="mt-1">Webhooks receive events for: room created/deleted, participant joined/left, track published/unpublished, egress started/stopped.</p>
            </div>
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
