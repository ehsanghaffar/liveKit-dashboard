import { NextResponse } from "next/server"
import { isLiveKitConfigured, getRoomService } from "@/lib/livekit-server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function bigintToNumber(v: bigint | number | undefined): number {
  if (typeof v === "bigint") return Number(v)
  return v ?? 0
}

export async function GET() {
  if (!isLiveKitConfigured()) {
    return NextResponse.json(
      { error: "LiveKit is not configured." },
      { status: 400 }
    )
  }
  try {
    const svc = getRoomService()
    const rooms = await svc.listRooms()
    const mapped = rooms.map((r) => {
      const created = bigintToNumber(r.creationTime)
      const createdMs = created > 1e12 ? created : created * 1000
      const nowSec = Math.floor(Date.now() / 1000)
      const createdSec = createdMs > 1e12 ? Math.floor(createdMs / 1000) : created
      const duration = createdSec > 0 ? Math.max(0, nowSec - createdSec) : 0
      return {
        id: r.sid || r.name,
        sid: r.sid,
        name: r.name,
        participants: r.numParticipants ?? 0,
        publishers: r.numPublishers ?? 0,
        maxParticipants: r.maxParticipants ?? 0,
        region: process.env.LIVEKIT_REGION ?? "auto",
        codec: "VP8" as const,
        bitrate: 0,
        status: (r.numParticipants ?? 0) > 0 ? ("live" as const) : ("idle" as const),
        createdAt: new Date(createdMs || Date.now()).toISOString(),
        durationSeconds: duration,
        recording: Boolean(r.activeRecording),
        metadata: r.metadata ?? "",
      }
    })
    return NextResponse.json({ rooms: mapped })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  if (!isLiveKitConfigured()) {
    return NextResponse.json({ error: "LiveKit is not configured." }, { status: 400 })
  }
  try {
    const body = (await req.json()) as {
      name: string
      emptyTimeout?: number
      departureTimeout?: number
      maxParticipants?: number
      metadata?: string
    }
    if (!body?.name) {
      return NextResponse.json({ error: "Room name is required." }, { status: 400 })
    }
    const svc = getRoomService()
    const room = await svc.createRoom({
      name: body.name,
      emptyTimeout: body.emptyTimeout ?? 300,
      departureTimeout: body.departureTimeout ?? 20,
      maxParticipants: body.maxParticipants ?? 0,
      metadata: body.metadata ?? "",
    })
    return NextResponse.json({ room: { sid: room.sid, name: room.name } })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}
