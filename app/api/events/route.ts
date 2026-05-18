import { NextResponse } from "next/server"
import { listWebhookEvents } from "@/lib/webhook-store"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const limit = Number(url.searchParams.get("limit") ?? "100")
  return NextResponse.json({ events: listWebhookEvents(limit) })
}
