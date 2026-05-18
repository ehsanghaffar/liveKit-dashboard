import { NextResponse } from "next/server"
import { isLiveKitConfigured, getEgressClient } from "@/lib/livekit-server"
import { EncodedFileType, EncodedFileOutput, EncodingOptionsPreset } from "livekit-server-sdk"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  if (!isLiveKitConfigured()) {
    return NextResponse.json(
      { error: "LiveKit is not configured." },
      { status: 400 }
    )
  }
  try {
    const client = getEgressClient()
    const list = await client.listEgress({})
    return NextResponse.json({
      egresses: list.map((e) => ({
        egressId: e.egressId,
        roomName: e.roomName,
        roomId: e.roomId,
        status: e.status,
        startedAt: Number(e.startedAt ?? 0),
        endedAt: Number(e.endedAt ?? 0),
        error: e.error,
      })),
      mock: false,
    })
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
      action: "start" | "stop"
      egressId?: string
      roomName?: string
      filepath?: string
      audioOnly?: boolean
    }
    const client = getEgressClient()
    if (body.action === "stop" && body.egressId) {
      const info = await client.stopEgress(body.egressId)
      return NextResponse.json({ ok: true, egress: { egressId: info.egressId, status: info.status } })
    }
    if (body.action === "start" && body.roomName) {
      const fileOutput = new EncodedFileOutput({
        fileType: EncodedFileType.MP4,
        filepath: body.filepath ?? `recordings/${body.roomName}-{time}.mp4`,
      })
      const info = await client.startRoomCompositeEgress(body.roomName, { file: fileOutput }, {
        layout: "speaker",
        audioOnly: body.audioOnly ?? false,
        encodingOptions: EncodingOptionsPreset.H264_720P_30,
      })
      return NextResponse.json({
        ok: true,
        egress: { egressId: info.egressId, status: info.status, roomName: info.roomName },
      })
    }
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}
