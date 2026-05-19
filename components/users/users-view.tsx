"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { Search, MoreHorizontal, UserMinus, Mic, MicOff, Video, VideoOff, Monitor, Eye, Copy, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { useI18n } from "@/lib/i18n"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Participant {
  id: string
  identity: string
  name: string
  room: string
  role: string
  audio: boolean
  video: boolean
  screen: boolean
  joinedAt: string
  state: string
}

export function UsersView() {
  const { t } = useI18n()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [roomFilter, setRoomFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setParticipants(data.participants || [])
      }
    } catch (err) {
      console.error('Failed to fetch participants:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchParticipants()
    const interval = setInterval(fetchParticipants, 4000)
    return () => clearInterval(interval)
  }, [fetchParticipants])

  const rooms = useMemo(() => {
    const uniqueRooms = new Set(participants.map((p) => p.room))
    return Array.from(uniqueRooms).sort()
  }, [participants])

  const filtered = useMemo(() => {
    return participants.filter((p) => {
      const matchQuery = !query || 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.identity.toLowerCase().includes(query.toLowerCase()) ||
        p.room.toLowerCase().includes(query.toLowerCase())
      const matchRoom = roomFilter === "all" || p.room === roomFilter
      const matchRole = roleFilter === "all" || p.role === roleFilter
      return matchQuery && matchRoom && matchRole
    })
  }, [participants, query, roomFilter, roleFilter])

  async function removeParticipant(room: string, identity: string, name: string) {
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room, identity }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      toast.success(`Removed ${name} from ${room}`)
      await fetchParticipants()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove participant")
    }
  }

  const initials = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()

  const formatJoinedAt = (joinedAt: string) => {
    const date = new Date(joinedAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{t("users.title") || "Participants"}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("users.subtitle") || "Manage participants across all rooms"}</p>
        </div>
        <Button onClick={fetchParticipants} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl bg-card ring-1 ring-border p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="size-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search participants..." className="ps-9" />
        </div>
        <Select value={roomFilter} onValueChange={setRoomFilter}>
          <SelectTrigger className="w-44">
            <Filter className="size-4 me-1" />
            <SelectValue placeholder="All rooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All rooms</SelectItem>
            {rooms.map((room) => (
              <SelectItem key={room} value={room}>{room}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="publisher">Publishers</SelectItem>
            <SelectItem value="viewer">Viewers</SelectItem>
          </SelectContent>
        </Select>
        <div className="ms-auto text-xs text-muted-foreground">
          {filtered.length} of {participants.length} participants
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead>Participant</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Media</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                  Loading participants...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                  No participants found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={`${p.room}-${p.id}`} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 ring-1 ring-border">
                        <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">{initials(p.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono truncate">{p.identity}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/rooms/${p.room}`} className="text-sm text-primary hover:underline font-mono">
                      {p.room}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ring-1",
                      p.role === "publisher" 
                        ? "text-primary bg-primary/10 ring-primary/20" 
                        : "text-muted-foreground bg-muted ring-border"
                    )}>
                      {p.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {p.audio ? (
                        <Mic className="size-3.5 text-success" />
                      ) : (
                        <MicOff className="size-3.5 text-muted-foreground" />
                      )}
                      {p.video ? (
                        <Video className="size-3.5 text-success" />
                      ) : (
                        <VideoOff className="size-3.5 text-muted-foreground" />
                      )}
                      {p.screen && (
                        <Monitor className="size-3.5 text-chart-2" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatJoinedAt(p.joinedAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={p.state === "active" ? "live" : "idle"} pulse={p.state === "active"}>
                      {p.state}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/rooms/${p.room}`}>
                            <Eye className="size-4" /> View room
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { 
                          navigator.clipboard.writeText(p.identity).catch(() => toast.error("Failed to copy"))
                          toast.success("Identity copied")
                        }}>
                          <Copy className="size-4" /> Copy identity
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => removeParticipant(p.room, p.identity, p.name)}
                        >
                          <UserMinus className="size-4" /> Remove from room
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
    </div>
  )
}
