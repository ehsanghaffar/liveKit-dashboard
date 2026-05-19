# LiveKit Dashboard — Documentation

Production-grade admin and operator dashboard for self-hosted LiveKit. Inspect rooms, issue tokens, monitor WebRTC transports, and manage your realtime infrastructure from a single, fast operator console.

## What This Does

LiveKit Dashboard is a Next.js 16 web application that provides a visual interface for managing a self-hosted [LiveKit](https://livekit.io) server. LiveKit is an open-source WebRTC server for real-time audio, video, and data streaming. This dashboard lets you:

- **Monitor live rooms** — See active sessions, participant counts, codecs, and bitrates
- **Manage participants** — Inspect, mute, or remove participants from rooms
- **Generate access tokens** — Create signed JWTs for publishers, viewers, and admins
- **Record sessions** — Start and stop room recordings (egress)
- **View webhooks** — Receive and inspect LiveKit webhook events
- **Monitor system health** — Track CPU, memory, and network metrics

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ 
- [pnpm](https://pnpm.io/) package manager
- [Docker](https://docker.com/) (for local LiveKit server)

### 1. Install Dependencies

```sh
pnpm install
```

### 2. Configure Environment

Copy the example environment file and fill in your LiveKit credentials:

```sh
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
LIVEKIT_URL=http://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_REGION=auto
```

### 3. Start LiveKit Server (Local Development)

```sh
cd livekit-server && docker compose up
```

This starts:
- **LiveKit server** on `:7880`
- **Redis** on `:6379`
- **SIP gateway** for telephony integration

### 4. Run the Dashboard

```sh
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Use any credentials to log in (the login page is a demo — no real authentication).

## Project Structure

```
livekit-nextjs-starter/
├── app/                          # Next.js App Router pages
│   ├── (app)/                    # Route group — pages behind the app shell
│   │   ├── layout.tsx            # Wraps all app pages with sidebar + topbar
│   │   ├── dashboard/page.tsx    # Overview dashboard
│   │   ├── rooms/page.tsx        # List of live rooms
│   │   ├── rooms/[id]/page.tsx   # Room detail view
│   │   ├── users/page.tsx        # Participants across all rooms
│   │   ├── tokens/page.tsx       # Token generator
│   │   ├── monitoring/page.tsx   # System metrics
│   │   ├── logs/page.tsx         # Server logs
│   │   └── settings/page.tsx     # Configuration settings
│   ├── login/page.tsx            # Demo login page (no real auth)
│   ├── page.tsx                  # Root redirect
│   └── api/                      # Server-side API routes (Node.js runtime)
│       ├── config/route.ts       # GET — LiveKit connection status
│       ├── rooms/route.ts        # GET — list rooms, POST — create room
│       ├── rooms/[name]/route.ts # GET — participants, DELETE — room/participant
│       ├── tokens/route.ts       # POST — mint access token (JWT)
│       ├── egress/route.ts       # GET — list egress, POST — start/stop recording
│       ├── events/route.ts       # GET — webhook event history
│       ├── monitoring/route.ts   # GET — system metrics
│       └── webhooks/livekit/     # POST — receive LiveKit webhooks
├── components/
│   ├── ui/                       # shadcn/ui primitives (new-york style)
│   ├── shell/                    # AppShell, SidebarNav, Topbar, CommandPalette
│   ├── dashboard/                # DashboardOverview, StatsCard, MetricChart, StatusBadge
│   ├── rooms/                    # RoomsView, RoomDetailView
│   ├── users/                    # UsersView
│   ├── tokens/                   # TokensView
│   ├── monitoring/               # MonitoringView
│   ├── logs/                     # LogsView
│   ├── settings/                 # SettingsView
│   └── error-boundary.tsx        # React error boundary
├── hooks/                        # React data-fetching hooks
│   ├── useRooms.ts               # Polls /api/rooms every 4s
│   ├── useParticipants.ts        # Polls /api/rooms/:name every 3s
│   ├── useEgress.ts              # Polls /api/egress every 5s
│   ├── useConfig.ts              # Fetches /api/config
│   ├── use-toast.ts              # Toast notification hook
│   └── use-mobile.ts             # Mobile viewport detection
├── lib/                          # Shared utilities and server SDK
│   ├── livekit-server.ts         # LiveKit SDK clients (RoomService, Egress, Tokens, Webhooks)
│   ├── mock-data.ts              # TypeScript type definitions (Room, Participant, etc.)
│   ├── webhook-store.ts          # In-memory webhook event store (500 max)
│   ├── i18n.tsx                  # English/Farsi i18n + RTL support
│   └── utils.ts                  # cn(), formatDuration(), formatBytes()
├── livekit-server/
│   └── docker-compose.yaml       # Docker Compose for LiveKit + Redis + SIP
├── public/                       # Static assets
├── docs/                         # This documentation
├── next.config.mjs               # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.mjs            # PostCSS configuration (Tailwind v4)
└── package.json                  # Dependencies and scripts
```

## Key Concepts

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Dashboard │  │  Rooms   │  │  Tokens  │  │ Monitoring │  │
│  │  Page     │  │   Page   │  │   Page   │  │    Page    │  │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  │
│        │              │              │               │        │
│  ┌─────┴──────────────┴──────────────┴───────────────┴─────┐  │
│  │              Custom React Hooks (Polling)                 │  │
│  │        useRooms() · useParticipants() · useEgress()       │  │
│  └────────────────────────┬─────────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────────┘
                            │ fetch()
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                   Next.js API Routes (Server)                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ /api/rooms │ │ /api/tokens│ │ /api/egress│ │ /api/events│  │
│  └──────┬─────┘ └──────┬─────┘ └──────┬─────┘ └──────┬─────┘  │
│         │              │              │               │        │
│  ┌──────┴──────────────┴──────────────┴───────────────┴─────┐  │
│  │              lib/livekit-server.ts                        │  │
│  │   RoomServiceClient · EgressClient · AccessToken · etc.   │  │
│  └────────────────────────┬─────────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────────┘
                            │ SDK calls
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                    LiveKit Server (:7880)                      │
│         Rooms · Participants · WebRTC · Egress                 │
└───────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Client-side hooks** (`useRooms`, `useParticipants`, `useEgress`) poll API routes at fixed intervals
2. **API routes** (`/api/*`) run on the Node.js server and call the LiveKit Server SDK
3. **LiveKit Server SDK** communicates with the LiveKit server over HTTP/gRPC
4. **Webhooks** flow in the opposite direction: LiveKit server → `/api/webhooks/livekit` → in-memory store

### Polling Strategy (No WebSockets)

The dashboard uses HTTP polling instead of WebSockets for real-time updates:

| Hook | Endpoint | Interval |
|------|----------|----------|
| `useRooms()` | `/api/rooms` | 4 seconds |
| `useParticipants(room)` | `/api/rooms/:name` | 3 seconds |
| `useEgress()` | `/api/egress` | 5 seconds |

Each hook uses `AbortController` to cancel in-flight requests when the component unmounts or re-fetches.

### Authentication

**There is no real authentication.** The login page (`/login`) simulates sign-in with a `setTimeout` delay. Any email/password combination works. This is intentional for a demo/starter template. For production, add real auth via middleware, sessions, or OAuth.

### i18n (Internationalization)

The dashboard supports English (`en`) and Farsi (`fa`) with automatic RTL layout switching:

- Locale is stored in `localStorage` under the key `"locale"`
- Use the `useI18n()` hook to access `t()` (translation function), `locale`, and `dir`
- Translation keys follow a dot-notation pattern: `"dashboard.title"`, `"rooms.subtitle"`, etc.
- Farsi text automatically triggers `dir="rtl"` on the `<html>` element

## Common Tasks

### Adding a New Page

1. Create a page file in `app/(app)/your-page/page.tsx`
2. Create a view component in `components/your-page/your-page-view.tsx`
3. Add a navigation item in `components/shell/sidebar-nav.tsx`
4. Add translation keys in `lib/i18n.tsx` for both `en` and `fa`

### Adding a New API Route

1. Create a route file at `app/api/your-endpoint/route.ts`
2. Set `export const dynamic = "force-dynamic"` and `export const runtime = "nodejs"`
3. Import SDK clients from `@/lib/livekit-server`
4. Always check `isLiveKitConfigured()` before making SDK calls
5. Return `NextResponse.json()` with appropriate status codes

### Adding a New UI Component

1. Use shadcn/ui CLI to add primitives: `pnpm dlx shadcn@latest add <component>`
2. Place custom components in `components/` or a feature subdirectory
3. Use `cn()` from `@/lib/utils` to merge Tailwind classes

### Starting a Room Recording

```sh
curl -X POST http://localhost:3000/api/egress \
  -H "Content-Type: application/json" \
  -d '{"action":"start","roomName":"my-room"}'
```

### Generating an Access Token

```sh
curl -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "user-123",
    "room": "my-room",
    "canPublish": true,
    "canSubscribe": true,
    "ttlSeconds": 3600
  }'
```

## API Reference

### `GET /api/config`

Returns LiveKit connection status and configuration.

**Response:**
```json
{
  "configured": true,
  "url": "http://localhost:7880",
  "hasApiKey": true,
  "hasApiSecret": true,
  "region": "auto",
  "connectionStatus": "connected",
  "roomCount": 3,
  "error": null
}
```

### `GET /api/rooms`

Lists all active rooms.

**Response:**
```json
{
  "rooms": [
    {
      "id": "RM_abc123",
      "name": "meeting-room-1",
      "participants": 4,
      "maxParticipants": 20,
      "region": "auto",
      "codec": "VP8",
      "bitrate": 0,
      "status": "live",
      "createdAt": "2026-05-19T10:00:00.000Z",
      "durationSeconds": 3600,
      "recording": false
    }
  ]
}
```

### `POST /api/rooms`

Creates a new room.

**Request:**
```json
{
  "name": "new-room",
  "emptyTimeout": 300,
  "departureTimeout": 20,
  "maxParticipants": 0,
  "metadata": ""
}
```

### `GET /api/rooms/:name`

Lists participants in a specific room.

### `DELETE /api/rooms/:name`

Deletes a room. Add `?identity=user-123` to remove a specific participant instead.

### `POST /api/tokens`

Generates a signed JWT access token.

**Request:**
```json
{
  "identity": "user-123",
  "room": "my-room",
  "canPublish": true,
  "canSubscribe": true,
  "canPublishData": false,
  "ttlSeconds": 3600
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "url": "http://localhost:7880",
  "identity": "user-123",
  "expiresIn": 3600
}
```

### `GET /api/egress`

Lists active and completed recording sessions.

### `POST /api/egress`

Starts or stops a room recording.

**Start recording:**
```json
{
  "action": "start",
  "roomName": "my-room",
  "filepath": "recordings/my-room-{time}.mp4",
  "audioOnly": false
}
```

**Stop recording:**
```json
{
  "action": "stop",
  "egressId": "EG_abc123"
}
```

### `POST /api/webhooks/livekit`

Receives webhook events from the LiveKit server. Configure your LiveKit project to send events to this endpoint.

**Headers:**
- `Content-Type: application/webhook+json`
- `Authorization: <JWT>`

### `GET /api/events`

Returns the list of recorded webhook events (stored in-memory, max 500).

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LIVEKIT_URL` | Yes | `http://localhost:7880` | URL of your LiveKit server |
| `LIVEKIT_API_KEY` | Yes | `devkey` | API key for authentication |
| `LIVEKIT_API_SECRET` | Yes | `secret` | API secret for authentication |
| `LIVEKIT_REGION` | No | `auto` | Region identifier for multi-region setups |

## Troubleshooting

### "LiveKit is not configured" Error

Make sure `.env.local` exists and contains valid `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`. Restart the dev server after changing environment variables.

### Cannot Connect to LiveKit Server

1. Verify LiveKit is running: `cd livekit-server && docker compose ps`
2. Check the URL in `.env.local` matches your LiveKit server address
3. For local development, the default is `http://localhost:7880`

### Webhooks Not Being Received

1. Configure your LiveKit project to send webhooks to `http://your-domain/api/webhooks/livekit`
2. For local development, use a tunnel service like [ngrok](https://ngrok.com) to expose your localhost
3. Verify the `Authorization` header contains a valid JWT signed with your API key/secret

### TypeScript Build Errors

The project is configured with `ignoreBuildErrors: true` in `next.config.mjs`. This is intentional for the starter template. TypeScript errors will still show in your editor but won't block the build.

### Webhook Events Lost on Redeploy

The webhook store is in-memory and resets on every redeploy. This is by design for the starter template. For production, persist events to a database (see `lib/webhook-store.ts` for the interface).

## Architecture Decisions

### Why Polling Instead of WebSockets?

**Decision:** HTTP polling at fixed intervals instead of WebSocket subscriptions

**Context:** This is a starter template meant to be simple and easy to understand.

**Reasoning:**
- Simpler to implement and debug
- No persistent connection management
- Works behind any reverse proxy without special configuration
- Sufficient for admin dashboards where sub-second updates aren't critical

**Trade-offs:**
- Higher latency for real-time updates (3-5 second delay)
- More HTTP requests over time
- Easier to reason about and test

### Why No Real Authentication?

**Decision:** Demo login page with `setTimeout` simulation

**Context:** This is a starter template, not a production application.

**Reasoning:**
- Reduces setup complexity for developers trying the template
- Focuses on LiveKit integration rather than auth boilerplate
- Easy to replace with real auth when deploying to production

**For Production:** Add Next.js middleware, session management (e.g., `next-auth`), or OAuth integration.

### Why In-Memory Webhook Store?

**Decision:** JavaScript array with 500-event cap

**Context:** Starter template for development and demonstration.

**Reasoning:**
- Zero external dependencies
- No database setup required
- Fast and simple

**For Production:** Replace with PostgreSQL, Redis, or any persistent store. The interface in `lib/webhook-store.ts` provides a clean abstraction to swap out.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.7 |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (new-york style) |
| Charts | Recharts |
| Forms | react-hook-form + Zod |
| Server SDK | livekit-server-sdk v2 |
| Package Manager | pnpm |
| Fonts | Geist, Geist Mono, Vazirmatn (Farsi) |
| Analytics | Vercel Analytics |
| Local Server | Docker Compose (LiveKit + Redis + SIP) |

## Useful Commands

```sh
pnpm install          # Install dependencies
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint

cd livekit-server && docker compose up    # Start local LiveKit
cd livekit-server && docker compose down  # Stop local LiveKit
```

## Links

- [LiveKit Documentation](https://docs.livekit.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
