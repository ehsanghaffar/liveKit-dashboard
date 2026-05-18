"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, Command, Search, LogOut, User2, Languages, ServerCog, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import { LayoutDashboard, Radio, KeyRound, Activity, ScrollText, Settings } from "lucide-react"

const items = [
  { href: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard" },
  { href: "/rooms", icon: Radio, key: "nav.rooms" },
  { href: "/tokens", icon: KeyRound, key: "nav.tokens" },
  { href: "/monitoring", icon: Activity, key: "nav.monitoring" },
  { href: "/logs", icon: ScrollText, key: "nav.logs" },
  { href: "/settings", icon: Settings, key: "nav.settings" },
] as const

export function Topbar({ onCommandPalette }: { onCommandPalette?: () => void }) {
  const { t, locale, setLocale } = useI18n()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="h-full flex items-center gap-2 px-4 lg:px-6">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={locale === "fa" ? "right" : "left"} className="p-0 w-72">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">Primary navigation menu</SheetDescription>
            <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
              <div className="size-8 rounded-xl bg-primary/15 grid place-items-center ring-1 ring-primary/30">
                <ServerCog className="size-4 text-primary" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">{t("app.name")}</div>
                <div className="text-[11px] text-muted-foreground">{t("app.tagline")}</div>
              </div>
            </div>
            <nav className="p-3 space-y-1">
              {items.map((it) => {
                const active = pathname === it.href || pathname.startsWith(it.href + "/")
                const Icon = it.icon
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                      "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
                      active && "bg-sidebar-accent text-foreground ring-1 ring-border",
                    )}
                  >
                    <Icon className={cn("size-4", active && "text-primary")} />
                    {t(it.key)}
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Search / command palette */}
        <button
          type="button"
          onClick={onCommandPalette}
          className={cn(
            "group hidden md:flex items-center gap-2 h-9 px-3 rounded-xl",
            "bg-card/60 ring-1 ring-border hover:ring-ring/40 transition w-full max-w-md",
          )}
        >
          <Search className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t("common.search")}</span>
          <span className="ms-auto flex items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>

        <div className="md:hidden flex-1">
          <Input placeholder={t("common.search")} className="h-9" />
        </div>

        <div className="ms-auto flex items-center gap-1.5">
          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Change language">
                <Languages className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocale("en")} className={cn(locale === "en" && "bg-accent")}>
                <span className="me-2">🇬🇧</span> English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale("fa")} className={cn(locale === "fa" && "bg-accent")}>
                <span className="me-2">🇮🇷</span> فارسی
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="size-4" />
            <span className="absolute top-1.5 end-1.5 size-1.5 rounded-full bg-destructive" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onCommandPalette} aria-label="Command palette">
            <Command className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-2 gap-2">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">OP</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-xs font-medium">Operator</span>
                  <span className="text-[10px] text-muted-foreground">admin@livekit.local</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{t("nav.account")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User2 className="size-4 me-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="size-4 me-2" /> {t("nav.settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/login")} className="text-destructive focus:text-destructive">
                <LogOut className="size-4 me-2" /> {t("common.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
