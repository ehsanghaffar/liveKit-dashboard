"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ServerCog, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useI18n } from "@/lib/i18n"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Welcome back, Operator")
      router.push("/dashboard")
    }, 800)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Visual side */}
      <div className="hidden lg:flex relative overflow-hidden bg-sidebar border-r border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary/15 grid place-items-center ring-1 ring-primary/30">
              <ServerCog className="size-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">{t("app.name")}</div>
              <div className="text-[11px] text-muted-foreground">{t("app.tagline")}</div>
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-success bg-success/10 ring-1 ring-success/20 px-2 py-0.5 rounded-full">
              <span className="size-1.5 rounded-full bg-success animate-pulse-dot" />
              ALL SYSTEMS OPERATIONAL
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              The control plane for your <span className="text-primary">realtime</span> infrastructure.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Inspect rooms, mint signed JWTs, stream logs, and watch every WebRTC transport across your fleet — from a single, fast operator console.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { v: "12d 4h", l: "Uptime" },
                { v: "487", l: "Live peers" },
                { v: "3", l: "Nodes" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-card/60 ring-1 ring-border p-3">
                  <div className="text-lg font-semibold tabular-nums">{s.v}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground font-mono">
            v1.7.2 • build a1f9c2 • © {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary/15 grid place-items-center ring-1 ring-primary/30">
              <ServerCog className="size-5 text-primary" />
            </div>
            <div className="text-sm font-semibold">{t("app.name")}</div>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("auth.welcome")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("auth.subtitle")}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" placeholder="admin@livekit.local" required defaultValue="admin@livekit.local" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  {t("auth.forgot")}
                </Link>
              </div>
              <Input id="password" type="password" required defaultValue="demo-password" />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" defaultChecked />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                {t("auth.remember")}
              </Label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : (
                <>
                  {t("auth.signin")} <ArrowRight className="size-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">{t("auth.demo")}</p>
          </form>
        </div>
      </div>
    </div>
  )
}
