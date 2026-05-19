"use client"

import { useState } from "react"
import { 
  Copy, 
  KeyRound, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  QrCode, 
  Share2, 
  Sparkles,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/lib/i18n"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const TOKEN_TYPES = ["viewer", "publisher", "admin", "custom"] as const
type TokenType = typeof TOKEN_TYPES[number]

interface AdvancedGrants {
  canPublish: boolean
  canSubscribe: boolean
  canPublishData: boolean
  canPublishSources: string[]
  canUpdateOwnMetadata: boolean
  hidden: boolean
  roomCreate: boolean
  roomList: boolean
  roomAdmin: boolean
  roomRecord: boolean
  ingressAdmin: boolean
  sipAdmin: boolean
  sipCall: boolean
}

export function TokensView() {
  const { t } = useI18n()
  const [type, setType] = useState<TokenType>("publisher")
  const [room, setRoom] = useState("webinar-product-launch")
  const [identity, setIdentity] = useState("user_8f2a1b")
  const [exp, setExp] = useState("3600")
  const [metadata, setMetadata] = useState('{"name":"Operator","tier":"pro"}')
  const [perms, setPerms] = useState<AdvancedGrants>({
    publish: true,
    subscribe: true,
    data: true,
    recorder: false,
    canPublishSources: ["camera", "microphone"],
    canUpdateOwnMetadata: false,
    hidden: false,
    roomCreate: false,
    roomList: false,
    roomAdmin: false,
    roomRecord: false,
    ingressAdmin: false,
    sipAdmin: false,
    sipCall: false
  })
  const [token, setToken] = useState("")
  const [reveal, setReveal] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const grants = {
        identity,
        room: room || undefined,
        canPublish: perms.canPublish,
        canSubscribe: perms.canSubscribe,
        canPublishData: perms.canPublishData,
        canPublishSources: perms.canPublishSources.length > 0 ? perms.canPublishSources : undefined,
        canUpdateOwnMetadata: perms.canUpdateOwnMetadata,
        hidden: perms.hidden,
        roomCreate: perms.roomCreate,
        roomList: perms.roomList,
        roomAdmin: perms.roomAdmin,
        roomRecord: perms.roomRecord,
        ingressAdmin: perms.ingressAdmin,
        ttlSeconds: Number(exp),
        name: JSON.parse(metadata).name || undefined,
      }

      // Remove undefined values
      Object.keys(grants).forEach(key => grants[key] === undefined && delete grants[key])

      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grants),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setToken(data.token)
      toast.success("Token generated")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate token")
    } finally {
      setLoading(false)
    }
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
                   onClick={() => {
                     setType(tt);
                     // Auto-show advanced permissions for custom type
                     if (tt === "custom") {
                       setShowAdvanced(true);
                     } else {
                       // Hide advanced permissions for preset types
                       setShowAdvanced(false);
                       // Reset to preset values
                       if (tt === "viewer") {
                         setPerms({
                           ...perms,
                           canPublish: false,
                           canSubscribe: true,
                           canPublishData: false,
                           recorder: false,
                           canPublishSources: [],
                           canUpdateOwnMetadata: false,
                           hidden: false,
                           roomCreate: false,
                           roomList: false,
                           roomAdmin: false,
                           roomRecord: false,
                           ingressAdmin: false,
                           sipAdmin: false,
                           sipCall: false
                         });
                       } else if (tt === "publisher") {
                         setPerms({
                           ...perms,
                           canPublish: true,
                           canSubscribe: true,
                           canPublishData: true,
                           recorder: false,
                           canPublishSources: ["camera", "microphone"],
                           canUpdateOwnMetadata: false,
                           hidden: false,
                           roomCreate: false,
                           roomList: false,
                           roomAdmin: false,
                           roomRecord: false,
                           ingressAdmin: false,
                           sipAdmin: false,
                           sipCall: false
                         });
                       } else if (tt === "admin") {
                         setPerms({
                           ...perms,
                           canPublish: true,
                           canSubscribe: true,
                           canPublishData: true,
                           recorder: true,
                           canPublishSources: ["camera", "microphone", "screen_share", "screen_share_audio"],
                           canUpdateOwnMetadata: true,
                           hidden: false,
                           roomCreate: true,
                           roomList: true,
                           roomAdmin: true,
                           roomRecord: true,
                           ingressAdmin: true,
                           sipAdmin: true,
                           sipCall: true
                         });
                       }
                     }
                   }}
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
                     {tt === "custom" && "custom permissions"}
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
             <div className="space-y-2">
               <div className="flex items-center justify-between rounded-xl bg-accent/30 ring-1 ring-border px-3 py-2.5">
                 <span className="text-sm">{t("tokens.canPublish")}</span>
                 <Switch
                   checked={perms.canPublish}
                   onCheckedChange={(v) => setPerms({ ...perms, canPublish: v })}
                 />
               </div>
               <div className="flex items-center justify-between rounded-xl bg-accent/30 ring-1 ring-border px-3 py-2.5">
                 <span className="text-sm">{t("tokens.canSubscribe")}</span>
                 <Switch
                   checked={perms.canSubscribe}
                   onCheckedChange={(v) => setPerms({ ...perms, canSubscribe: v })}
                 />
               </div>
               <div className="flex items-center justify-between rounded-xl bg-accent/30 ring-1 ring-border px-3 py-2.5">
                 <span className="text-sm">{t("tokens.canPublishData")}</span>
                 <Switch
                   checked={perms.canPublishData}
                   onCheckedChange={(v) => setPerms({ ...perms, canPublishData: v })}
                 />
               </div>
               <div className="flex items-center justify-between rounded-xl bg-accent/30 ring-1 ring-border px-3 py-2.5">
                 <span className="text-sm">{t("tokens.recorder")}</span>
                 <Switch
                   checked={perms.roomRecord}
                   onCheckedChange={(v) => setPerms({ ...perms, roomRecord: v })}
                 />
               </div>
             </div>
             
             {/* Advanced permissions (collapsible) */}
             <div className="mt-4">
               <button
                 type="button"
                 onClick={() => setShowAdvanced(!showAdvanced)}
                 className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
               >
                 {showAdvanced ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                 <span>{t("tokens.advancedPermissions")}</span>
               </button>
               
               {showAdvanced && (
                 <div className="mt-3 space-y-2 pt-3 border-t border-border">
                   <div className="text-sm font-medium mb-2">{t("tokens.videoPermissions")}</div>
                   <div className="space-y-1">
                     <label className="flex items-center gap-2 text-xs">
                       <Switch
                         checked={perms.hidden}
                         onCheckedChange={(v) => setPerms({ ...perms, hidden: v })}
                       />
                       <span>{t("tokens.hidden")}</span>
                     </label>
                   </div>
                   
                   <div className="mt-2">
                     <label className="block text-xs font-medium mb-1">{t("tokens.publishSources")}</label>
                     <div className="flex flex-wrap gap-2">
                       {["camera", "microphone", "screen_share", "screen_share_audio"].map((source) => (
                         <label key={source} className="flex items-center gap-1 text-xs">
                           <input
                             type="checkbox"
                             checked={perms.canPublishSources.includes(source)}
                             onChange={(e) => {
                               if (e.target.checked) {
                                 setPerms({ ...perms, canPublishSources: [...perms.canPublishSources, source] })
                               } else {
                                 setPerms({ ...perms, canPublishSources: perms.canPublishSources.filter(s => s !== source) })
                               }
                             }}
                             className="h-4 w-4"
                           />
                           <span>{source}</span>
                         </label>
                       ))}
                     </div>
                   </div>
                   
                   <div className="mt-2">
                     <label className="block text-xs font-medium mb-1">{t("tokens.roomPermissions")}</label>
                     <div className="space-y-1">
                       <label className="flex items-center gap-2 text-xs">
                         <Switch
                           checked={perms.roomCreate}
                           onChange={(v) => setPerms({ ...perms, roomCreate: v })}
                         />
                         <span>{t("tokens.roomCreate")}</span>
                       </label>
                       <label className="flex items-center gap-2 text-xs">
                         <Switch
                           checked={perms.roomList}
                           onChange={(v) => setPerms({ ...perms, roomList: v })}
                         />
                         <span>{t("tokens.roomList")}</span>
                       </label>
                       <label className="flex items-center gap-2 text-xs">
                         <Switch
                           checked={perms.roomAdmin}
                           onChange={(v) => setPerms({ ...perms, roomAdmin: v })}
                         />
                         <span>{t("tokens.roomAdmin")}</span>
                       </label>
                       <label className="flex items-center gap-2 text-xs">
                         <Switch
                           checked={perms.roomRecord}
                           onChange={(v) => setPerms({ ...perms, roomRecord: v })}
                         />
                         <span>{t("tokens.roomRecord")}</span>
                       </label>
                     </div>
                   </div>
                   
                   <div className="mt-2">
                     <label className="block text-xs font-medium mb-1">{t("tokens.sipPermissions")}</label>
                     <div className="space-y-1">
                       <label className="flex items-center gap-2 text-xs">
                         <Switch
                           checked={perms.sipAdmin}
                           onChange={(v) => setPerms({ ...perms, sipAdmin: v })}
                         />
                         <span>{t("tokens.sipAdmin")}</span>
                       </label>
                       <label className="flex items-center gap-2 text-xs">
                         <Switch
                           checked={perms.sipCall}
                           onChange={(v) => setPerms({ ...perms, sipCall: v })}
                         />
                         <span>{t("tokens.sipCall")}</span>
                       </label>
                     </div>
                   </div>
                 </div>
               )}
             </div>
           </div>
               <div className="flex items-center justify-between rounded-xl bg-accent/30 ring-1 ring-border px-3 py-2.5">
                 <span className="text-sm">{t("tokens.canSubscribe")}</span>
                 <Switch
                   checked={perms.subscribe}
                   onCheckedChange={(v) => setPerms({ ...perms, subscribe: v })}
                 />
               </div>
               <div className="flex items-center justify-between rounded-xl bg-accent/30 ring-1 ring-border px-3 py-2.5">
                 <span className="text-sm">{t("tokens.canPublishData")}</span>
                 <Switch
                   checked={perms.data}
                   onCheckedChange={(v) => setPerms({ ...perms, data: v })}
                 />
               </div>
               <div className="flex items-center justify-between rounded-xl bg-accent/30 ring-1 ring-border px-3 py-2.5">
                 <span className="text-sm">{t("tokens.recorder")}</span>
                 <Switch
                   checked={perms.recorder}
                   onCheckedChange={(v) => setPerms({ ...perms, recorder: v })}
                 />
               </div>
             </div>
             
             {/* Advanced permissions (collapsible) */}
             <div className="mt-4">
               <button
                 type="button"
                 onClick={() => setShowAdvanced(!showAdvanced)}
                 className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
               >
                 {showAdvanced ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                 <span>{t("tokens.advancedPermissions")}</span>
               </button>
               
               {showAdvanced && (
                 <div className="mt-3 space-y-2 pt-3 border-t border-border">
                   <div className="text-sm font-medium mb-2">{t("tokens.videoPermissions")}</div>
                   <div className="space-y-1">
                     <label className="flex items-center gap-2 text-xs">
                       <Switch
                         checked={perms.hidden}
                         onCheckedChange={(v) => setPerms({ ...perms, hidden: v })}
                       />
                       <span>{t("tokens.hidden")}</span>
                     </label>
                   </div>
                   
                   <div className="mt-2">
                     <label className="block text-xs font-medium mb-1">{t("tokens.publishSources")}</label>
                     <div className="flex flex-wrap gap-2">
                       {["camera", "microphone", "screen_share", "screen_share_audio"].map((source) => (
                         <label key={source} className="flex items-center gap-1 text-xs">
                           <input
                             type="checkbox"
                             checked={perms.publishSources.includes(source)}
                             onChange={(e) => {
                               if (e.target.checked) {
                                 setPerms({ ...perms, publishSources: [...perms.publishSources, source] })
                               } else {
                                 setPerms({ ...perms, publishSources: perms.publishSources.filter(s => s !== source) })
                               }
                             }}
                             className="h-4 w-4"
                           />
                           <span>{source}</span>
                         </label>
                       ))}
                     </div>
                   </div>
                   
                   <div className="mt-2">
                     <label className="block text-xs font-medium mb-1">{t("tokens.roomPermissions")}</label>
                     <div className="space-y-1">
                       <label className="flex items-center gap-2 text-xs">
                         <Switch
                           checked={perms.roomCreate}
                           onChange={(v) => setPerms({ ...perms, roomCreate: v })}
                         />
                         <span>{t("tokens.roomCreate")}</span>
                       </label>
                       <label className="flex items-center gap-2 text-xs">
                         <Switch
                           checked={perms.roomList}
                           onChange={(v) => setPerms({ ...perms, roomList: v })}
                         />
                         <span>{t("tokens.roomList")}</span>
                       </label>
                       <label className="flex items-center gap-2 text-xs">
                         <Switch
                           checked={perms.roomAdmin}
                           onChange={(v) => setPerms({ ...perms, roomAdmin: v })}
                         />
                         <span>{t("tokens.roomAdmin")}</span>
                       </label>
                       <label className="flex items-center gap-2 text-xs">
                         <Switch
                           checked={perms.roomRecord}
                           onChange={(v) => setPerms({ ...perms, roomRecord: v })}
                         />
                         <span>{t("tokens.roomRecord")}</span>
                       </label>
                     </div>
                   </div>
                   
                   <div className="mt-2">
                     <label className="block text-xs font-medium mb-1">{t("tokens.sipPermissions")}</label>
                     <div className="space-y-1">
                       <label className="flex items-center gap-2 text-xs">
                         <Switch
                           checked={perms.sipAdmin}
                           onChange={(v) => setPerms({ ...perms, sipAdmin: v })}
                         />
                         <span>{t("tokens.sipAdmin")}</span>
                       </label>
                       <label className="flex items-center gap-2 text-xs">
                         <Switch
                           checked={perms.sipCall}
                           onChange={(v) => setPerms({ ...perms, sipCall: v })}
                         />
                         <span>{t("tokens.sipCall")}</span>
                       </label>
                     </div>
                   </div>
                 </div>
               )}
             </div>
           </div>

           <Button onClick={generate} size="lg" className="w-full" disabled={loading}>
             {loading ? "Generating..." : <Sparkles className="size-4" /> }
             {t("tokens.generate")}
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
              <Button variant="outline" disabled={!token} onClick={() => { navigator.clipboard.writeText(token).catch(() => toast.error("Failed to copy")); toast.success(t("common.copied")) }}>
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
             {token && !reveal ? (
               <span className="text-muted-foreground italic">Click to reveal token details</span>
             ) : token && reveal ? (
               <pre className="font-mono text-[11px] text-muted-foreground bg-background ring-1 ring-border rounded-xl p-3 overflow-auto scrollbar-thin">
                 {JSON.stringify(
                   {
                     iss: process.env.LIVEKIT_API_KEY,
                     sub: identity,
                     exp: Math.floor(Date.now() / 1000) + Number(exp),
                     nbf: Math.floor(Date.now() / 1000),
                     video: {
                       roomJoin: true,
                       room: room || "",
                       canPublish: perms.canPublish,
                       canSubscribe: perms.canSubscribe,
                       canPublishData: perms.canPublishData,
                       canPublishSources: perms.canPublishSources.length > 0 ? perms.canPublishSources : undefined,
                       canUpdateOwnMetadata: perms.canUpdateOwnMetadata,
                       hidden: perms.hidden,
                       roomCreate: perms.roomCreate,
                       roomList: perms.roomList,
                       roomAdmin: perms.roomAdmin,
                       roomRecord: perms.roomRecord,
                       ingressAdmin: perms.ingressAdmin,
                       sip: perms.sipAdmin || perms.sipCall ? {
                         admin: perms.sipAdmin,
                         call: perms.sipCall
                       } : undefined
                     },
                     metadata: JSON.parse(metadata),
                   },
                   null,
                   2
                 )}
               </pre>
             ) : (
               <span className="text-muted-foreground italic">Click generate to issue a signed token</span>
             )}
           </div>
        </div>
      </div>
    </div>
  )
}
