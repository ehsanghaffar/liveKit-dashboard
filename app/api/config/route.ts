import { NextResponse } from "next/server"
import { getLiveKitConfig, isLiveKitConfigured } from "@/lib/livekit-server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  if (!isLiveKitConfigured()) {
    return NextResponse.json(
      { error: "LiveKit is not configured." },
      { status: 400 }
    )
  }
  
  const cfg = getLiveKitConfig()
  return NextResponse.json({
    configured: true,
    url: cfg.url,
    hasApiKey: Boolean(cfg.apiKey),
    hasApiSecret: Boolean(cfg.apiSecret),
    region: cfg.region,
  })
}
