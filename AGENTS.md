# AGENTS.md — LiveKit Dashboard

Single-page Next.js 16 App Router dashboard (`livekit-nextjs-starter`). Not a monorepo.

## Quick start

```sh
pnpm install          # install deps
pnpm dev              # next dev (http://localhost:3000)
pnpm build            # next build
pnpm lint             # eslint . (no custom config; falls back to Next.js defaults)
```

## Project structure

```
app/                   # Next.js App Router pages
  (app)/               # Route group — pages behind the app shell (sidebar + topbar)
    dashboard/
    rooms/
    rooms/[id]/
    tokens/
    monitoring/
    logs/
    settings/
  login/               # Dummy login page (no real auth)
  api/
    config/            # GET — LiveKit connection status
    rooms/             # GET — list rooms, POST — create room
    rooms/[name]/      # GET — participants, DELETE — room or participant
    tokens/            # POST — mint access token (JWT)
    egress/            # GET — list egress, POST — start/stop recording
    events/            # GET — webhook event history (in-memory store)
    webhooks/livekit/  # POST — receive LiveKit webhooks
components/
  ui/                  # shadcn/ui primitives (new-york style)
  shell/               # AppShell, SidebarNav, Topbar, CommandPalette
  dashboard/           # DashboardOverview, StatsCard, MetricChart, StatusBadge
  rooms/               # RoomsView, RoomDetailView
  logs/                # LogsView
  tokens/              # TokensView
  monitoring/          # MonitoringView
  settings/            # SettingsView
hooks/                 # useRooms, useParticipants, useEgress, useConfig
lib/
  livekit-server.ts    # RoomServiceClient, EgressClient, WebhookReceiver, AccessToken
  mock-data.ts         # Type definitions only (Room, Participant, LogEntry, etc.)
  webhook-store.ts     # In-memory event store (500 max, per-process, lost on redeploy)
  i18n.tsx             # en/fa + RTL provider
  utils.ts             # cn(), formatDuration(), formatBytes()
livekit-server/
  docker-compose.yaml  # LiveKit + Redis + SIP for local dev
```

## Key env vars (copy `.env.local.example` → `.env.local`)

```
LIVEKIT_URL=http://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_REGION=auto
```

## Architecture facts

- **Frontend-only**: This is a Next.js app. It calls the LiveKit Server SDK from server-side API routes (not from the client). All API routes use `runtime: "nodejs"` and `dynamic: "force-dynamic"`.
- **No real auth**: Login page simulates sign-in with a setTimeout. No session, no middleware. Any credentials work.
- **Snap/polling — no WebSockets**: Hooks poll on fixed intervals: rooms every 4s, egress every 5s, participants every 3s.
- **Webhook store is per-process in-memory**: Resets on every redeploy. Not for production.
- **TypeScript errors ignored at build time**: `next.config.mjs` sets `ignoreBuildErrors: true`. Don't let tsc errors block you.
- **No tests exist** in this repo.
- **shadcn/ui**: Uses `new-york` style. Add new primitives via `pnpm dlx shadcn@latest add <component>`. Components use `@/components/ui/`, utils from `@/lib/utils.ts` (`cn` function).
- **Tailwind v4**: CSS uses `@import "tailwindcss"` and `@import "tw-animate-css"` (NOT `@tailwind` directives). Theme variables via `@theme inline {}`. PostCSS plugin is `@tailwindcss/postcss`.
- **i18n**: en/fa with RTL auto-switching. Locale persisted in `localStorage` key `"locale"`. Use `useI18n()` for `t()`, `locale`, `dir`.
- **Dark mode by default**: `defaultTheme="dark"` in `ThemeProvider`. Light mode possible via toggle.
- **Path alias**: `@/*` maps to project root (not `src/`).

## Local LiveKit

```sh
cd livekit-server && docker compose up
```

Starts LiveKit in dev mode on `:7880` with Redis on `:6379`. Matches the default `.env.local` credentials.
