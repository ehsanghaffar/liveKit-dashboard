import { NextResponse } from "next/server"
import { isLiveKitConfigured, getRoomService } from "@/lib/livekit-server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: Request) {
  if (!isLiveKitConfigured()) {
    return NextResponse.json({ error: "LiveKit is not configured." }, { status: 400 })
  }

  const url = new URL(req.url)
  const identity = url.searchParams.get("identity")
  const room = url.searchParams.get("room")

  try {
    const svc = getRoomService()

    // If searching for a specific identity across all rooms
    if (identity) {
      const rooms = await svc.listRooms()
      const results: Array<{ room: string; participant: any }> = []

      for (const r of rooms) {
        try {
          const participants = await svc.listParticipants(r.name)
          const found = participants.find((p) => p.identity === identity)
          if (found) {
            results.push({ room: r.name, participant: found })
          }
        } catch {
          // Skip rooms where we can't fetch participants
        }
      }

      return NextResponse.json({ participants: results })
    }

    // If fetching participants for a specific room
    if (room) {
      const participants = await svc.listParticipants(room)
      const mapped = participants.map((p) => ({
        id: p.sid,
        sid: p.sid,
        identity: p.identity,
        name: p.name || p.identity,
        role: p.permission?.canPublish ? "publisher" : "viewer",
        audio: p.tracks?.some((t) => t.type === 0 && !t.muted) ?? false,
        video: p.tracks?.some((t) => t.type === 1 && !t.muted) ?? false,
        screen: p.tracks?.some((t) => t.source === 3) ?? false,
        joinedAt: new Date(Number(p.joinedAt ?? 0) * 1000).toISOString(),
        state: p.state,
        metadata: p.metadata ?? "",
        tracks: (p.tracks ?? []).map((t) => ({
          sid: t.sid,
          type: t.type,
          source: t.source,
          muted: t.muted,
          name: t.name,
          mimeType: t.mimeType,
        })),
      }))
      return NextResponse.json({ room, participants: mapped })
    }

    // Fetch all participants across all rooms
    const rooms = await svc.listRooms()
    const allParticipants: Array<{
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
    }> = []

    for (const r of rooms) {
      try {
        const participants = await svc.listParticipants(r.name)
        for (const p of participants) {
          allParticipants.push({
            id: p.sid,
            identity: p.identity,
            name: p.name || p.identity,
            room: r.name,
            role: p.permission?.canPublish ? "publisher" : "viewer",
            audio: p.tracks?.some((t) => t.type === 0 && !t.muted) ?? false,
            video: p.tracks?.some((t) => t.type === 1 && !t.muted) ?? false,
            screen: p.tracks?.some((t) => t.source === 3) ?? false,
            joinedAt: new Date(Number(p.joinedAt ?? 0) * 1000).toISOString(),
            state: p.state ?? "active",
          })
        }
      } catch {
        // Skip rooms where we can't fetch participants
      }
    }

    return NextResponse.json({ participants: allParticipants, totalRooms: rooms.length })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  if (!isLiveKitConfigured()) {
    return NextResponse.json({ error: "LiveKit is not configured." }, { status: 400 })
  }

  try {
    const body = await req.json()
    const { room, identity } = body

    if (!room || !identity) {
      return NextResponse.json({ error: "Room and identity are required." }, { status: 400 })
    }

    const svc = getRoomService()
    await svc.removeParticipant(room, identity)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}
