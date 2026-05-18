"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Radio, KeyRound, Activity, ScrollText, Settings, ServerCog } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

const items = [
  { href: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard" },
  { href: "/rooms", icon: Radio, key: "nav.rooms" },
  { href: "/tokens", icon: KeyRound, key: "nav.tokens" },
  { href: "/monitoring", icon: Activity, key: "nav.monitoring" },
  { href: "/logs", icon: ScrollText, key: "nav.logs" },
  { href: "/settings", icon: Settings, key: "nav.settings" },
] as const

export function SidebarNav({ className }: { className?: string }) {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-sidebar/60 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
        <div className="size-8 rounded-xl bg-primary/15 grid place-items-center ring-1 ring-primary/30">
          <ServerCog className="size-4 text-primary" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">{t("app.name")}</div>
          <div className="text-[11px] text-muted-foreground">{t("app.tagline")}</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/")
          const Icon = it.icon
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
                "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
                active && "bg-sidebar-accent text-foreground ring-1 ring-border",
              )}
            >
              <Icon className={cn("size-4", active && "text-primary")} />
              <span className="font-medium">{t(it.key)}</span>
              {active && <span className="ms-auto size-1.5 rounded-full bg-primary animate-pulse-dot" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="rounded-xl bg-card/60 ring-1 ring-border p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            <span>Cluster healthy</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-muted-foreground">v1.7.2 • 3 nodes</div>
        </div>
      </div>
    </aside>
  )
}
