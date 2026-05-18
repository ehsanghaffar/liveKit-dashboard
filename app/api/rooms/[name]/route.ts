import { NextResponse } from "next/server"
import { isLiveKitConfigured, getRoomService } from "@/lib/livekit-server"
import { mockParticipants } from "@/lib/mock-data"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type Ctx = { params: Promise<{ name: string }> }

export async function GET(_req: Request, ctx: Ctx) {
  const { name } = await ctx.params
  const room = decodeURIComponent(name)
  if (!isLiveKitConfigured()) {
    return NextResponse.json({ room, participants: mockParticipants, mock: true })
  }
  try {
    const svc = getRoomService()
    const participants = await svc.listParticipants(room)
    const mapped = participants.map((p) => ({
      id: p.sid,
      sid: p.sid,
      identity: p.identity,
      name: p.name || p.identity,
      role: p.permission?.canPublish ? ("publisher" as const) : ("viewer" as const),
      audio: p.tracks?.some((t) => t.type === 0 && !t.muted) ?? false,
      video: p.tracks?.some((t) => t.type === 1 && !t.muted) ?? false,
      screen: p.tracks?.some((t) => t.source === 3) ?? false,
      bitrateKbps: 0,
      quality: "good" as const,
      device: "unknown",
      browser: "unknown",
      region: process.env.LIVEKIT_REGION ?? "auto",
      pingMs: 0,
      packetLoss: 0,
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
    return NextResponse.json({ room, participants: mapped, mock: false })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  if (!isLiveKitConfigured()) {
    return NextResponse.json({ error: "LiveKit is not configured." }, { status: 400 })
  }
  const { name } = await ctx.params
  const room = decodeURIComponent(name)
  const url = new URL(req.url)
  const identity = url.searchParams.get("identity")
  try {
    const svc = getRoomService()
    if (identity) {
      await svc.removeParticipant(room, identity)
      return NextResponse.json({ ok: true })
    }
    await svc.deleteRoom(room)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}
