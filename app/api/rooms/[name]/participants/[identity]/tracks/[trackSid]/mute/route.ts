import { NextResponse } from "next/server"
import { isLiveKitConfigured, getRoomService } from "@/lib/livekit-server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type Ctx = { params: Promise<{ name: string; identity: string; trackSid: string }> }

export async function POST(req: Request, ctx: Ctx) {
  if (!isLiveKitConfigured()) {
    return NextResponse.json({ error: "LiveKit is not configured." }, { status: 400 })
  }
  const { name, identity, trackSid } = await ctx.params
  const room = decodeURIComponent(name)
  const ident = decodeURIComponent(identity)
  const sid = decodeURIComponent(trackSid)
  try {
    const body = (await req.json().catch(() => ({}))) as { muted?: boolean }
    const svc = getRoomService()
    await svc.mutePublishedTrack(room, ident, sid, body.muted ?? true)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}
