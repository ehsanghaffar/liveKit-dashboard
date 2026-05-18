"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/shell/sidebar-nav"
import { Topbar } from "@/components/shell/topbar"
import { CommandPalette } from "@/components/shell/command-palette"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onCommandPalette={() => setPaletteOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  )
}
