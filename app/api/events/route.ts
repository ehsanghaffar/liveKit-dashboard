import { NextResponse } from "next/server"
import { listWebhookEvents, type StoredWebhookEvent } from "@/lib/webhook-store"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const limit = Number(url.searchParams.get("limit") ?? "100")
  const room = url.searchParams.get("room")
  const participant = url.searchParams.get("participant")
  const eventType = url.searchParams.get("type")
  const since = url.searchParams.get("since")

  let events = listWebhookEvents(limit)

  // Filter by room
  if (room) {
    events = events.filter((e) => e.room === room)
  }

  // Filter by participant
  if (participant) {
    events = events.filter((e) => e.participant === participant)
  }

  // Filter by event type
  if (eventType && eventType !== "all") {
    events = events.filter((e) => e.event.includes(eventType))
  }

  // Filter by timestamp
  if (since) {
    const sinceTs = Number(since)
    events = events.filter((e) => e.createdAt >= sinceTs)
  }

  // Get unique rooms for filtering
  const allEvents = listWebhookEvents(500)
  const uniqueRooms = [...new Set(allEvents.map((e) => e.room).filter(Boolean))] as string[]
  const uniqueParticipants = [...new Set(allEvents.map((e) => e.participant).filter(Boolean))] as string[]
  const uniqueEventTypes = [...new Set(allEvents.map((e) => e.event))]

  return NextResponse.json({ 
    events, 
    filters: {
      rooms: uniqueRooms,
      participants: uniqueParticipants,
      eventTypes: uniqueEventTypes,
    }
  })
}

export async function DELETE(req: Request) {
  const { clearWebhookEvents } = await import("@/lib/webhook-store")
  if (typeof clearWebhookEvents === "function") {
    clearWebhookEvents()
  }
  return NextResponse.json({ ok: true })
}
