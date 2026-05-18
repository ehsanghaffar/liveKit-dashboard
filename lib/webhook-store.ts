/**
 * In-memory webhook event store.
 *
 * NOTE: This is per-process and resets on redeploy. For production, persist
 * to a database (e.g. Supabase, Neon, or Upstash Redis).
 */

export type StoredWebhookEvent = {
  id: string
  event: string
  createdAt: number
  room?: string
  participant?: string
  raw: unknown
}

const MAX_EVENTS = 500
const events: StoredWebhookEvent[] = []

export function recordWebhookEvent(e: StoredWebhookEvent) {
  events.unshift(e)
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS
}

export function listWebhookEvents(limit = 100): StoredWebhookEvent[] {
  return events.slice(0, Math.min(limit, events.length))
}
