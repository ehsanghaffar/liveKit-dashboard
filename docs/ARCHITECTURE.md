# Architecture Overview

## What This Project Is

This repository is a LiveKit operator dashboard built with Next.js App Router. It combines a client-side UI shell with server-side API routes that connect to a LiveKit cluster and provide admin controls.

## System Design

The dashboard is split into three main layers:

1. **Presentation layer**
   - `app/login/page.tsx` — fake login and operator onboarding
   - `app/(app)/...` — protected dashboard pages rendered inside the app shell
   - `components/` — reusable UI building blocks and page-specific views

2. **Server API layer**
   - `app/api/*` — Next.js route handlers that talk to LiveKit server SDK helpers
   - `app/api/config/route.ts` — probes LiveKit readiness
   - `app/api/tokens/route.ts` — mints JWT access tokens
   - `app/api/rooms/*` — room and participant management
   - `app/api/egress/route.ts` — egress start/stop operations
   - `app/api/webhooks/livekit/route.ts` — webhook receiver and validation

3. **Integration layer**
   - `lib/livekit-server` helper module (imported from `app/api/*`) manages LiveKit environment config, client construction, and webhook validation
   - `lib/mock-data.ts` provides fallback data for frontend pages when LiveKit is not configured
   - `lib/webhook-store.ts` stores webhook events in memory

## Directory Structure

```text
app/
├── api/                     # Server route handlers
├── login/                   # Login page
└── (app)/                   # Protected dashboard pages behind shell layout
components/                  # UI components and dashboard pages
lib/                         # Shared helpers, mock data, webhook store
livekit-server/              # Local LiveKit Docker compose setup
docs/                        # Documentation files
```

## Data Flow

### Dashboard page flow

1. User navigates to `/dashboard` after login.
2. The protected `AppShell` renders the current dashboard page.
3. Dashboard components call `/api/*` endpoints for LiveKit data.
4. API routes use helper functions from `lib/livekit-server` to talk to LiveKit.
5. Responses are returned to the UI and rendered in charts, tables, and room views.

### LiveKit configuration flow

1. `GET /api/config` returns whether LiveKit is configured and which values are available.
2. If LiveKit is not configured, the frontend continues using mock data.
3. When env vars exist, server routes use real LiveKit SDK clients.

### Room and participant flow

- `GET /api/rooms` fetches room list
- `POST /api/rooms` creates a room with default timeouts
- `GET /api/rooms/[name]` lists participants in the selected room
- `DELETE /api/rooms/[name]?identity=...` removes a participant
- `DELETE /api/rooms/[name]` deletes the room entirely
- `POST /api/rooms/[name]/participants/[identity]/tracks/[trackSid]/mute` mutes/unmutes a published track

### Webhook flow

- LiveKit sends webhook events to `/api/webhooks/livekit`
- The handler validates the signed JWT payload with `getWebhookReceiver()`
- Verified events are stored in memory using `recordWebhookEvent()`

## LiveKit Local Runtime

`livekit-server/docker-compose.yaml` provides a local development environment with:

- `redis` service for LiveKit session state
- `livekit` service in dev mode
- `sip` gateway configuration for SIP support

The compose file uses `network_mode: host`, so it is intended for local development only.

## Key Design Decisions

- **Mock fallback first:** The project is designed to run even without a configured LiveKit cluster, making onboarding faster.
- **Server routes in App Router:** This keeps integration logic close to frontend pages and supports a monorepo-style demo app.
- **In-memory webhook storage:** Simple for demo use, but clearly marked as non-production.
- **Fake auth UI:** The login page simulates operator access without actual session management.

## Extension Points

- Add a real auth layer and session checks in `app/(app)/layout.tsx`
- Persist webhooks to a database in `lib/webhook-store.ts`
- Add room metrics and participant telemetry in API responses
- Expand `app/api/egress/route.ts` to support more LiveKit egress modes
- Add a `/api/health` or `/api/status` endpoint for operational checks
