"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, MoreHorizontal, Eye, Trash2, Copy, Link2, ScrollText, Plus, Filter, Mic, Video, Disc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { useRooms } from "@/hooks/useRooms"
import { useI18n } from "@/lib/i18n"
import { toast } from "sonner"
import { cn, formatBytes, formatDuration } from "@/lib/utils"

const REGIONS = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1", "me-central-1"]

export function RoomsView() {
  const { t } = useI18n()
  const { rooms, loading } = useRooms()
  const [query, setQuery] = useState("")
  const [region, setRegion] = useState<string>("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    return rooms.filter((r) => {
      const matchQ = !query || r.name.toLowerCase().includes(query.toLowerCase()) || r.id.toLowerCase().includes(query.toLowerCase())
      const matchR = region === "all" || r.region === region
      return matchQ && matchR
    })
  }, [rooms, query, region])

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id))

  function toggleAll() {
    if (allSelected) {
      const next = new Set(selected)
      filtered.forEach((r) => next.delete(r.id))
      setSelected(next)
    } else {
      const next = new Set(selected)
      filtered.forEach((r) => next.add(r.id))
      setSelected(next)
    }
  }

  function toggle(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{t("rooms.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("rooms.subtitle")}</p>
        </div>
        <Button>
          <Plus className="size-4" /> {t("rooms.new")}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl bg-card ring-1 ring-border p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="size-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("common.search")} className="ps-9" />
        </div>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-44">
            <Filter className="size-4 me-1" />
            <SelectValue placeholder={t("common.region")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All regions</SelectItem>
            <SelectItem value="us-east-1">us-east-1</SelectItem>
            <SelectItem value="us-west-2">us-west-2</SelectItem>
            <SelectItem value="eu-west-1">eu-west-1</SelectItem>
            <SelectItem value="ap-southeast-1">ap-southeast-1</SelectItem>
            <SelectItem value="me-central-1">me-central-1</SelectItem>
          </SelectContent>
        </Select>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 ms-auto">
            <span className="text-xs text-muted-foreground">{selected.size} selected</span>
            <Button size="sm" variant="outline" onClick={() => toast("Disconnected " + selected.size + " rooms")}>
              {t("rooms.disconnect")}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => { setSelected(new Set()); toast.success("Deleted") }}>
              <Trash2 className="size-4" /> {t("common.delete")}
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
              </TableHead>
              <TableHead>{t("rooms.name")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-end">{t("rooms.participants")}</TableHead>
              <TableHead>{t("common.region")}</TableHead>
              <TableHead>{t("rooms.codec")}</TableHead>
              <TableHead className="text-end">{t("rooms.bitrate")}</TableHead>
              <TableHead className="text-end">{t("common.duration")}</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="h-32 text-center text-sm text-muted-foreground">
                  {t("rooms.empty")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} className={cn("border-border", selected.has(r.id) && "bg-accent/40")}>
                  <TableCell>
                    <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggle(r.id)} aria-label="Select row" />
                  </TableCell>
                  <TableCell>
                    <Link href={`/rooms/${r.id}`} className="group flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-primary/10 ring-1 ring-primary/20 grid place-items-center">
                        <Mic className="size-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium group-hover:text-primary transition truncate">{r.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono truncate">{r.id}</div>
                      </div>
                      {r.recording && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-destructive bg-destructive/10 ring-1 ring-destructive/20 px-1.5 py-0.5 rounded-md ms-2">
                          <Disc className="size-2.5 animate-pulse-dot" /> REC
                        </span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={r.status} pulse={r.status === "live"}>
                      {r.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    <span className="font-medium">{r.participants}</span>
                    <span className="text-muted-foreground"> / {r.maxParticipants}</span>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{r.region}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded-md bg-accent ring-1 ring-border">
                      <Video className="size-3" /> {r.codec}
                    </span>
                  </TableCell>
                  <TableCell className="text-end tabular-nums text-sm">{formatBytes(r.bitrate)}</TableCell>
                  <TableCell className="text-end tabular-nums text-sm">{formatDuration(r.durationSeconds)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/rooms/${r.id}`}>
                            <Eye className="size-4" /> {t("rooms.inspect")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(r.id); toast.success(t("common.copied")) }}>
                          <Copy className="size-4" /> {t("rooms.copyId")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link2 className="size-4" /> {t("rooms.invite")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ScrollText className="size-4" /> {t("rooms.viewLogs")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="size-4" /> {t("rooms.deleteRoom")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {filtered.length} of {rooms.length} rooms</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  )
}
