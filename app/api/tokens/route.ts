import { NextResponse } from "next/server"
import { createAccessToken, isLiveKitConfigured, type TokenGrants } from "@/lib/livekit-server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(req: Request) {
  if (!isLiveKitConfigured()) {
    return NextResponse.json({ error: "LiveKit is not configured." }, { status: 400 })
  }
  try {
    const grants = (await req.json()) as TokenGrants
    if (!grants?.identity) {
      return NextResponse.json({ error: "identity is required." }, { status: 400 })
    }
    const token = await createAccessToken(grants)
    return NextResponse.json({
      token,
      url: process.env.LIVEKIT_URL,
      identity: grants.identity,
      expiresIn: grants.ttlSeconds ?? 21600,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}
