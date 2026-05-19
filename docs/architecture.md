# Architecture Documentation

## System Design

The LiveKit Dashboard is a **single-page Next.js application** that acts as an admin console for a self-hosted LiveKit server. It follows a client-server architecture within a single Next.js codebase:

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser                                 │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React Components                        │  │
│  │                                                             │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │  AppShell   │  │  Page Views │  │  UI Components  │   │  │
│  │  │ (layout)    │  │ (dashboard, │  │  (shadcn/ui)    │   │  │
│  │  │             │  │  rooms, etc)│  │                 │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │  │
│  │         │                │                   │            │  │
│  │  ┌──────┴────────────────┴───────────────────┴────────┐   │  │
│  │  │              Custom React Hooks                     │   │  │
│  │  │   useRooms() · useParticipants() · useEgress()      │   │  │
│  │  │   useConfig() · use-toast() · use-mobile()          │   │  │
│  │  └──────────────────────┬─────────────────────────────┘   │  │
│  └─────────────────────────┼─────────────────────────────────┘  │
│                            │ fetch() to /api/*                  │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Server (Node.js)                      │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   API Routes (/api/*)                      │  │
│  │                                                             │  │
│  │  /api/config     — Connection status                       │  │
│  │  /api/rooms      — List/create rooms                       │  │
│  │  /api/rooms/:id  — Participants, delete room/participant   │  │
│  │  /api/tokens     — Generate JWT access tokens              │  │
│  │  /api/egress     — List/start/stop recordings              │  │
│  │  /api/events     — Webhook event history                   │  │
│  │  /api/monitoring — System metrics                          │  │
│  │  /api/webhooks/* — Receive LiveKit webhooks                │  │
│  │                                                             │  │
│  └──────────────────────┬────────────────────────────────────┘  │
│                         │                                        │
│  ┌──────────────────────┴────────────────────────────────────┐  │
│  │              lib/livekit-server.ts                         │  │
│  │                                                             │  │
│  │  • RoomServiceClient (singleton)                           │  │
│  │  • EgressClient (singleton)                                │  │
│  │  • WebhookReceiver (singleton)                             │  │
│  │  • createAccessToken()                                     │  │
│  │  • getLiveKitConfig() / isLiveKitConfigured()              │  │
│  │                                                             │  │
│  └──────────────────────┬────────────────────────────────────┘  │
│                         │                                        │
│  ┌──────────────────────┴────────────────────────────────────┐  │
│  │              lib/webhook-store.ts                          │  │
│  │                                                             │  │
│  │  • In-memory event store (max 500 events)                  │  │
│  │  • recordWebhookEvent() / listWebhookEvents()              │  │
│  │                                                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────┬─────────────────────────────────────────┘
                          │ LiveKit Server SDK (HTTP/gRPC)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LiveKit Server (:7880)                        │
│                                                                   │
│  • Room management                                               │
│  • Participant management                                        │
│  • WebRTC SFU (Selective Forwarding Unit)                        │
│  • Egress (recording/streaming)                                  │
│  • Webhook event dispatch                                        │
│                                                                   │
└─────────────────────────┬─────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Redis (:6379)                               │
│                                                                   │
│  • Message bus for LiveKit cluster                               │
│  • State synchronization across nodes                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

### `app/` — Next.js App Router

The `app/` directory contains all pages and API routes using Next.js 16's App Router.

| Path | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with ThemeProvider, I18nProvider, Toaster, and Analytics |
| `app/page.tsx` | Root page (redirects to login or dashboard) |
| `app/login/page.tsx` | Demo login page (no real authentication) |
| `app/(app)/layout.tsx` | App shell layout (sidebar + topbar wrapper) |
| `app/(app)/dashboard/` | Main overview dashboard |
| `app/(app)/rooms/` | Room listing and detail pages |
| `app/(app)/users/` | Participants view |
| `app/(app)/tokens/` | Token generator page |
| `app/(app)/monitoring/` | System monitoring page |
| `app/(app)/logs/` | Server logs page |
| `app/(app)/settings/` | Settings page |
| `app/api/` | All server-side API routes (Node.js runtime) |

**Why the `(app)` route group?** Pages inside `(app)/` share a common layout with sidebar navigation and topbar. The parentheses make `(app)` a route group — it doesn't appear in the URL path.

### `components/` — React Components

| Directory | Purpose |
|-----------|---------|
| `components/ui/` | shadcn/ui primitive components (Button, Input, Dialog, etc.) |
| `components/shell/` | App layout: AppShell, SidebarNav, Topbar, CommandPalette |
| `components/dashboard/` | Dashboard-specific: DashboardView, StatsCard, MetricChart, StatusBadge |
| `components/rooms/` | Room-specific: RoomsView, RoomDetailView |
| `components/users/` | Participants view component |
| `components/tokens/` | Token generator view |
| `components/monitoring/` | Monitoring metrics view |
| `components/logs/` | Log viewer component |
| `components/settings/` | Settings form component |
| `components/error-boundary.tsx` | React error boundary wrapper |

### `hooks/` — Custom React Hooks

| Hook | Purpose | Polling Interval |
|------|---------|------------------|
| `useRooms()` | Fetches room list from `/api/rooms` | 4 seconds |
| `useParticipants(roomName)` | Fetches participants from `/api/rooms/:name` | 3 seconds |
| `useEgress()` | Fetches egress sessions from `/api/egress` | 5 seconds |
| `useConfig()` | Fetches connection config from `/api/config` | On mount |
| `use-toast()` | Toast notification management | N/A |
| `use-mobile()` | Detects mobile viewport | On resize |

### `lib/` — Shared Utilities

| File | Purpose |
|------|---------|
| `lib/livekit-server.ts` | LiveKit Server SDK initialization and client management |
| `lib/mock-data.ts` | TypeScript type definitions (Room, Participant, LogEntry, etc.) |
| `lib/webhook-store.ts` | In-memory webhook event storage |
| `lib/i18n.tsx` | Internationalization provider (en/fa with RTL) |
| `lib/utils.ts` | Utility functions: `cn()`, `formatDuration()`, `formatBytes()` |

### `livekit-server/` — Docker Compose

Contains `docker-compose.yaml` for running a local LiveKit server with Redis and SIP gateway.

## Data Flow

### 1. Room Listing Flow

```
User opens /rooms
       │
       ▼
RoomsView component mounts
       │
       ▼
useRooms() hook executes
       │
       ▼
fetch('/api/rooms')
       │
       ▼
API route: GET /api/rooms
       │
       ├── isLiveKitConfigured() check
       │
       └── getRoomService().listRooms()
              │
              ▼
         LiveKit Server SDK
              │
              ▼
         LiveKit Server (:7880)
              │
              ▼
         Returns room list
              │
              ▼
         Maps SDK response to Room[] type
              │
              ▼
         NextResponse.json({ rooms })
              │
              ▼
useRooms() receives response
       │
       ▼
setRooms(data.rooms)
       │
       ▼
RoomsView re-renders with room data
```

### 2. Token Generation Flow

```
User fills token form on /tokens
       │
       ▼
TokensView submits form
       │
       ▼
fetch('/api/tokens', { method: 'POST', body: grants })
       │
       ▼
API route: POST /api/tokens
       │
       ├── isLiveKitConfigured() check
       │
       └── createAccessToken(grants)
              │
              ├── new AccessToken(apiKey, apiSecret, { identity, ttl })
              │
              ├── at.addGrant({ roomJoin: true, room, canPublish, canSubscribe, ... })
              │
              └── at.toJwt()
                     │
                     ▼
                Returns JWT string
                     │
                     ▼
NextResponse.json({ token, url, identity, expiresIn })
                     │
                     ▼
TokensView displays token to user
```

### 3. Webhook Reception Flow

```
LiveKit Server detects event (room created, participant joined, etc.)
       │
       ▼
POST to configured webhook URL: /api/webhooks/livekit
       │
       ├── Headers: Content-Type: application/webhook+json
       │           Authorization: <signed JWT>
       │
       ▼
API route: POST /api/webhooks/livekit
       │
       ├── getWebhookReceiver().receive(body, auth)
       │      │
       │      └── Validates JWT signature against API key/secret
       │
       ├── recordWebhookEvent({ id, event, room, participant, raw })
       │      │
       │      └── Stores in-memory (max 500 events)
       │
       └── NextResponse.json({ ok: true })
              │
              ▼
User views events on /logs via GET /api/events
```

## Key Design Decisions

### Singleton Pattern for SDK Clients

**Decision:** SDK clients (RoomServiceClient, EgressClient, WebhookReceiver) are created as lazy singletons.

```typescript
let roomServiceInstance: RoomServiceClient | null = null

export function getRoomService(): RoomServiceClient {
  if (roomServiceInstance) return roomServiceInstance
  // ... create and cache
}
```

**Why:** 
- SDK clients are expensive to create (establish connections, parse config)
- Serverless environments may reuse containers across requests
- Singletons ensure one client per process lifetime

**Trade-off:** In a multi-tenant scenario, you'd need per-tenant clients instead.

### AbortController for Polling

**Decision:** Each polling hook uses `AbortController` to cancel stale requests.

```typescript
const abortRef = useRef<AbortController | null>(null)

const fetchRooms = useCallback(async () => {
  abortRef.current?.abort()        // Cancel previous request
  abortRef.current = new AbortController()
  const signal = abortRef.current.signal
  const res = await fetch('/api/rooms', { signal })
  // ...
}, [])
```

**Why:**
- Prevents race conditions when polling intervals overlap
- Avoids memory leaks from abandoned fetch promises
- Ensures UI always shows the most recent data

### Force-Dynamic API Routes

**Decision:** All API routes set `dynamic = "force-dynamic"` and `runtime = "nodejs"`.

```typescript
export const dynamic = "force-dynamic"
export const runtime = "nodejs"
```

**Why:**
- `force-dynamic` prevents Next.js from statically optimizing these routes (they must run on each request)
- `nodejs` ensures the route runs on Node.js (not Edge runtime), required for the LiveKit SDK
- These routes make external HTTP calls and must never be cached

### BigInt to Number Conversion

**Decision:** API routes convert `bigint` timestamps from the SDK to JavaScript `number`.

```typescript
function bigintToNumber(v: bigint | number | undefined): number {
  if (typeof v === "bigint") return Number(v)
  return v ?? 0
}
```

**Why:** The LiveKit Server SDK returns timestamps as `bigint` (to handle nanosecond precision), but `JSON.stringify` cannot serialize `bigint`. Converting to `number` is safe for second/millisecond precision.

## Module Dependencies

```
app/(app)/* pages
    │
    ├── components/shell/* (layout)
    ├── components/*/views (feature components)
    │       │
    │       ├── components/ui/* (primitives)
    │       └── hooks/* (data fetching)
    │               │
    │               └── app/api/* (HTTP endpoints)
    │                       │
    │                       └── lib/livekit-server.ts (SDK clients)
    │                               │
    │                               └── livekit-server-sdk (npm package)
    │
    └── lib/i18n.tsx (translations)

app/api/* routes
    │
    ├── lib/livekit-server.ts
    ├── lib/webhook-store.ts
    └── lib/mock-data.ts (types)
```

## Extension Points

### Adding Real Authentication

Replace the demo login by:
1. Adding `app/middleware.ts` with session validation
2. Integrating an auth provider (NextAuth, Clerk, Supabase Auth)
3. Protecting the `(app)` route group in middleware
4. Updating `/login` to use the real auth flow

### Adding Persistent Webhook Storage

Replace `lib/webhook-store.ts` with:
- **PostgreSQL:** Use Prisma or Drizzle ORM
- **Redis:** Use Upstash or self-hosted Redis
- **File-based:** Append to JSON lines file (for small deployments)

Keep the same function signatures (`recordWebhookEvent`, `listWebhookEvents`, `clearWebhookEvents`) for a drop-in replacement.

### Adding Real-Time Updates via WebSockets

Replace polling hooks with:
1. A WebSocket connection to the LiveKit server
2. Server-sent events (SSE) from a new `/api/stream` endpoint
3. LiveKit's own real-time events API

The hook interfaces (`UseRoomsReturn`, `UseParticipantsReturn`) can remain the same — only the internal implementation changes.

### Adding Multi-Region Support

The `LIVEKIT_REGION` env var is already passed through to room data. To support multiple regions:
1. Store multiple LiveKit configurations
2. Route API calls based on region parameter
3. Update the UI to filter/group by region
