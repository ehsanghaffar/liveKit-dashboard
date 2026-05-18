"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { LayoutDashboard, Radio, KeyRound, Activity, ScrollText, Settings, ServerCog } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  const go = (path: string) => {
    onOpenChange(false)
    router.push(path)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/dashboard")}>
            <LayoutDashboard /> {t("nav.dashboard")}
          </CommandItem>
          <CommandItem onSelect={() => go("/rooms")}>
            <Radio /> {t("nav.rooms")}
          </CommandItem>
          <CommandItem onSelect={() => go("/tokens")}>
            <KeyRound /> {t("nav.tokens")}
          </CommandItem>
          <CommandItem onSelect={() => go("/monitoring")}>
            <Activity /> {t("nav.monitoring")}
          </CommandItem>
          <CommandItem onSelect={() => go("/logs")}>
            <ScrollText /> {t("nav.logs")}
          </CommandItem>
          <CommandItem onSelect={() => go("/settings")}>
            <Settings /> {t("nav.settings")}
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/tokens")}>
            <KeyRound /> Generate new token
          </CommandItem>
          <CommandItem onSelect={() => go("/settings")}>
            <ServerCog /> Restart LiveKit server
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
