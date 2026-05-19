import { NextResponse } from "next/server"
import { getLiveKitConfig, isLiveKitConfigured, getRoomService } from "@/lib/livekit-server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const cfg = getLiveKitConfig()
  const configured = isLiveKitConfigured()
  
  let connectionStatus = "unknown"
  let roomCount = 0
  let error: string | null = null

  if (configured) {
    try {
      const svc = getRoomService()
      const rooms = await svc.listRooms()
      roomCount = rooms.length
      connectionStatus = "connected"
    } catch (err) {
      connectionStatus = "error"
      error = err instanceof Error ? err.message : "Unknown error"
    }
  } else {
    connectionStatus = "not_configured"
  }

  return NextResponse.json({
    configured,
    url: cfg.url,
    hasApiKey: Boolean(cfg.apiKey),
    hasApiSecret: Boolean(cfg.apiSecret),
    region: cfg.region,
    connectionStatus,
    roomCount,
    error,
  })
}
