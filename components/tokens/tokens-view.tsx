"use client"

import { useState } from "react"
import { Copy, KeyRound, Eye, EyeOff, RefreshCw, QrCode, Share2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/lib/i18n"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const TOKEN_TYPES = ["viewer", "publisher", "admin"] as const
type TokenType = typeof TOKEN_TYPES[number]

function fakeJwt() {
  const head = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, "")
  const payload = btoa(
    JSON.stringify({
      iss: "APIabc123def",
      sub: "user_" + Math.random().toString(36).slice(2, 8),
      exp: Math.floor(Date.now() / 1000) + 3600,
      video: { roomJoin: true, room: "webinar-product-launch" },
    }),
  ).replace(/=/g, "")
  const sig = Array.from({ length: 43 })
    .map(() => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"[Math.floor(Math.random() * 64)])
    .join("")
  return `${head}.${payload}.${sig}`
}

export function TokensView() {
  const { t } = useI18n()
  const [type, setType] = useState<TokenType>("publisher")
  const [room, setRoom] = useState("webinar-product-launch")
  const [identity, setIdentity] = useState("user_8f2a1b")
  const [exp, setExp] = useState("3600")
  const [metadata, setMetadata] = useState('{"name":"Operator","tier":"pro"}')
  const [perms, setPerms] = useState({ publish: true, subscribe: true, data: true, recorder: false })
  const [token, setToken] = useState("")
  const [reveal, setReveal] = useState(true)

  function generate() {
    setToken(fakeJwt())
    toast.success("Token generated")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{t("tokens.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("tokens.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3 rounded-2xl bg-card ring-1 ring-border p-6 space-y-5">
          <div className="space-y-2">
            <Label>{t("tokens.type")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {TOKEN_TYPES.map((tt) => (
                <button
                  key={tt}
                  type="button"
                  onClick={() => setType(tt)}
                  className={cn(
                    "rounded-xl ring-1 px-4 py-3 text-start transition",
                    type === tt
                      ? "ring-primary bg-primary/10"
                      : "ring-border bg-accent/30 hover:bg-accent/60",
                  )}
                >
                  <div className="text-sm font-semibold capitalize">{t(`tokens.${tt}`)}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {tt === "viewer" && "subscribe-only"}
                    {tt === "publisher" && "publish + subscribe"}
                    {tt === "admin" && "full room control"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room">{t("tokens.room")}</Label>
              <Input id="room" value={room} onChange={(e) => setRoom(e.target.value)} className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="identity">{t("tokens.identity")}</Label>
              <Input id="identity" value={identity} onChange={(e) => setIdentity(e.target.value)} className="font-mono" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("tokens.expires")}</Label>
              <Select value={exp} onValueChange={setExp}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="600">10 minutes</SelectItem>
                  <SelectItem value="3600">1 hour</SelectItem>
                  <SelectItem value="21600">6 hours</SelectItem>
                  <SelectItem value="86400">1 day</SelectItem>
                  <SelectItem value="604800">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta">{t("tokens.metadata")}</Label>
            <Textarea id="meta" value={metadata} onChange={(e) => setMetadata(e.target.value)} className="font-mono text-xs min-h-20" />
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <Label>{t("tokens.permissions")}</Label>
            {[
              { k: "publish", l: t("tokens.canPublish") },
              { k: "subscribe", l: t("tokens.canSubscribe") },
              { k: "data", l: t("tokens.canPublishData") },
              { k: "recorder", l: t("tokens.recorder") },
            ].map((p) => (
              <div key={p.k} className="flex items-center justify-between rounded-xl bg-accent/30 ring-1 ring-border px-3 py-2.5">
                <span className="text-sm">{p.l}</span>
                <Switch
                  checked={perms[p.k as keyof typeof perms]}
                  onCheckedChange={(v) => setPerms({ ...perms, [p.k]: v })}
                />
              </div>
            ))}
          </div>

          <Button onClick={generate} size="lg" className="w-full">
            <Sparkles className="size-4" /> {t("tokens.generate")}
          </Button>
        </div>

        {/* Output */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-card ring-1 ring-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-9 rounded-xl bg-primary/15 ring-1 ring-primary/30 grid place-items-center">
                  <KeyRound className="size-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">JWT Token</div>
                  <div className="text-[11px] text-muted-foreground">HS256 • {exp}s expiry</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setReveal((v) => !v)} aria-label="toggle reveal">
                {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>

            <div className="rounded-xl bg-background ring-1 ring-border p-3 font-mono text-[11px] break-all min-h-[120px] max-h-48 overflow-auto scrollbar-thin">
              {token ? (
                reveal ? (
                  <span>
                    <span className="text-chart-1">{token.split(".")[0]}</span>
                    <span className="text-muted-foreground">.</span>
                    <span className="text-chart-2">{token.split(".")[1]}</span>
                    <span className="text-muted-foreground">.</span>
                    <span className="text-chart-3">{token.split(".")[2]}</span>
                  </span>
                ) : (
                  "•".repeat(180)
                )
              ) : (
                <span className="text-muted-foreground italic">Click generate to issue a signed token</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" disabled={!token} onClick={() => { navigator.clipboard.writeText(token); toast.success(t("common.copied")) }}>
                <Copy className="size-4" /> {t("common.copy")}
              </Button>
              <Button variant="outline" disabled={!token}>
                <QrCode className="size-4" /> {t("tokens.qr")}
              </Button>
              <Button variant="outline" disabled={!token}>
                <Share2 className="size-4" /> {t("tokens.share")}
              </Button>
            </div>

            <Button variant="ghost" size="sm" onClick={generate} className="w-full text-muted-foreground">
              <RefreshCw className="size-3.5" /> Regenerate
            </Button>
          </div>

          <div className="rounded-2xl bg-card ring-1 ring-border p-5 text-xs">
            <div className="font-semibold mb-2">Decoded payload</div>
            <pre className="font-mono text-[11px] text-muted-foreground bg-background ring-1 ring-border rounded-xl p-3 overflow-auto scrollbar-thin">{`{
  "iss": "APIabc123def",
  "sub": "${identity}",
  "exp": ${Math.floor(Date.now() / 1000) + Number(exp)},
  "video": {
    "room": "${room}",
    "roomJoin": true,
    "canPublish": ${perms.publish},
    "canSubscribe": ${perms.subscribe},
    "canPublishData": ${perms.data}
  }
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
