import { NextResponse } from "next/server"
import { getLiveKitConfig, isLiveKitConfigured } from "@/lib/livekit-server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const cfg = getLiveKitConfig()
  return NextResponse.json({
    configured: isLiveKitConfigured(),
    url: cfg.url ?? null,
    hasApiKey: Boolean(cfg.apiKey),
    hasApiSecret: Boolean(cfg.apiSecret),
  })
}
