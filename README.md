# LiveKit Dashboard

A self-hosted operator console for LiveKit clusters built with Next.js 16 and a simplified LiveKit server backend.

This project is a developer-focused dashboard that demonstrates how to monitor rooms, mint access tokens, receive LiveKit webhooks, and control room state from a single admin console.

## Documentation

- `docs/ARCHITECTURE.md` — architecture overview and data flow
- `docs/API.md` — backend API reference for LiveKit routes

## What This Does

- Provides a protected dashboard shell with a login page and operator UI
- Exposes Next.js server routes for LiveKit configuration, tokens, rooms, egress, and webhook handling
- Supports mock fallback data when LiveKit is not configured
- Includes a local `docker-compose` setup for LiveKit + Redis

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the dashboard

```bash
pnpm dev
```

Open `http://localhost:3000`.

### 3. Configure LiveKit

Create a `.env.local` file in the project root with:

```env
LIVEKIT_URL=http://localhost:7880
LIVEKIT_API_KEY=<your_livekit_api_key>
LIVEKIT_API_SECRET=<your_livekit_api_secret>
LIVEKIT_REGION=auto
```

If you do not set LiveKit environment variables, the app will return an error on API routes instead of falling back to mock data.

### 4. Optional: Start a local LiveKit cluster

The repository includes a local LiveKit compose file at `livekit-server/docker-compose.yaml`.

```bash
cd livekit-server
docker compose up
```

This starts:
- `redis` for session state
- `livekit` server in developer mode
- Optional `sip` gateway configuration for SIP integration

## Project Structure

```text
.
├── app/                       # Next.js App Router pages and route handlers
│   ├── api/                   # Server routes for LiveKit integration
│   ├── login/                 # Login page UI
│   └── (app)/                 # Protected dashboard shell pages
├── components/                # UI components and dashboard views
├── lib/                       # Shared helpers, mocks, and webhook store
├── livekit-server/            # Local LiveKit + Redis docker-compose setup
├── public/                    # Static assets
├── styles/                    # Global styles
├── package.json               # Scripts and dependencies
└── pnpm-lock.yaml             # pnpm lockfile
```

## Key Concepts

- `app/(app)/layout.tsx` renders the protected dashboard shell using `AppShell`
- `app/login/page.tsx` provides a fake login flow and redirect to `/dashboard`
- Server routes under `app/api/` provide backend behavior for LiveKit operations
- `lib/mock-data.ts` supplies example data if LiveKit is not configured
- Local development can use `docker-compose` to run LiveKit and Redis

## Main Pages

- `/` → redirects to `/dashboard`
- `/login` → operator sign-in page
- `/dashboard` → dashboard overview view
- `/rooms` → room list and room detail views
- `/settings` → configuration and webhook settings display
- `/logs` → live log view
- `/monitoring` → monitoring dashboard
- `/tokens` → token minting preview

## API and Routes

The app exposes several backend endpoints under `/api`:

- `GET /api/config` — LiveKit configuration status
- `POST /api/tokens` — mint a signed LiveKit access token
- `GET /api/rooms` — list rooms; uses mock data if LiveKit is not configured
- `POST /api/rooms` — create a room on LiveKit
- `GET /api/rooms/[name]` — list participants for a room
- `DELETE /api/rooms/[name]` — delete a room or remove a participant
- `POST /api/rooms/[name]/participants/[identity]/tracks/[trackSid]/mute` — mute/unmute a published track
- `GET /api/egress` — list egress sessions
- `POST /api/egress` — start or stop egress recording
- `POST /api/webhooks/livekit` — receive signed LiveKit webhook events

## Environment Variables

- `LIVEKIT_URL` — LiveKit server URL
- `LIVEKIT_API_KEY` — LiveKit API key
- `LIVEKIT_API_SECRET` — LiveKit API secret
- `LIVEKIT_REGION` — optional region value, defaults to `auto`

## Notes

- The login page does not perform real authentication. It simulates an operator sign-in flow for the demo dashboard.
- `lib/webhook-store.ts` stores webhook events in memory only, so events are lost on restart.
- The app is built with React 19, Next.js 16, Tailwind CSS, Radix UI, and LiveKit server SDK.

## How to Extend

- Add new dashboard views under `components/` and corresponding `app/(app)/.../page.tsx` routes
- Add additional API handlers under `app/api/`
- Persist webhook or egress events using a database instead of `lib/webhook-store.ts`
- Add real authentication instead of the current simulated login flow
