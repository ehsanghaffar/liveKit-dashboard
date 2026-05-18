import { NextResponse } from "next/server"
import { getWebhookReceiver, isLiveKitConfigured } from "@/lib/livekit-server"
import { recordWebhookEvent } from "@/lib/webhook-store"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * LiveKit webhook receiver.
 * Configure your LiveKit project to POST events to this URL with
 * Content-Type: application/webhook+json
 *
 * The body is a signed JWT (Authorization header) plus a JSON payload.
 * We use WebhookReceiver to validate the signature against your API key+secret.
 */
export async function POST(req: Request) {
  if (!isLiveKitConfigured()) {
    return NextResponse.json({ error: "LiveKit is not configured." }, { status: 400 })
  }
  try {
    const auth = req.headers.get("authorization") ?? ""
    const body = await req.text()
    const receiver = getWebhookReceiver()
    const event = await receiver.receive(body, auth, true)
    recordWebhookEvent({
      id: event.id ?? crypto.randomUUID(),
      event: event.event ?? "unknown",
      createdAt: Number(event.createdAt ?? Math.floor(Date.now() / 1000)),
      room: event.room?.name,
      participant: event.participant?.identity,
      raw: event,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid webhook" },
      { status: 401 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    info: "POST LiveKit webhook events here. Set Content-Type: application/webhook+json.",
  })
}
