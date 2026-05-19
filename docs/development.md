# Development Guide

## Getting Started

### Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **pnpm** — Install with `npm install -g pnpm`
- **Docker** — For local LiveKit server ([Download](https://docker.com/))

### Initial Setup

```sh
# 1. Clone and install
pnpm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your LiveKit credentials

# 3. Start LiveKit server (in a separate terminal)
cd livekit-server && docker compose up

# 4. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Use any credentials to log in.

## Development Workflow

### Running the Dev Server

```sh
pnpm dev
```

- Starts Next.js on `http://localhost:3000`
- Hot module replacement (HMR) enabled
- Changes to components and pages reflect instantly

### Building for Production

```sh
pnpm build    # Compiles and optimizes
pnpm start    # Runs the production server
```

### Linting

```sh
pnpm lint     # Runs ESLint with Next.js defaults
```

## Adding a New Page

### Step 1: Create the Page

Create a new page file in `app/(app)/your-feature/page.tsx`:

```tsx
// app/(app)/your-feature/page.tsx
import { YourFeatureView } from "@/components/your-feature/your-feature-view"

export default function YourFeaturePage() {
  return <YourFeatureView />
}
```

### Step 2: Create the View Component

Create the view component in `components/your-feature/your-feature-view.tsx`:

```tsx
// components/your-feature/your-feature-view.tsx
"use client"

import { Card } from "@/components/ui/card"

export function YourFeatureView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Your Feature</h1>
        <p className="text-muted-foreground">Description of your feature</p>
      </div>
      <Card className="p-6">
        {/* Your feature content */}
      </Card>
    </div>
  )
}
```

### Step 3: Add Navigation

Add a navigation item in `components/shell/sidebar-nav.tsx`:

```tsx
// Find the navItems array and add your entry:
{
  name: t("nav.yourFeature"),
  href: "/your-feature",
  icon: YourIcon,
}
```

### Step 4: Add Translations

Add translation keys in `lib/i18n.tsx` for both languages:

```typescript
// In the `en` dictionary:
"nav.yourFeature": "Your Feature",

// In the `fa` dictionary:
"nav.yourFeature": "ویژگی شما",
```

## Adding an API Route

### Step 1: Create the Route File

Create a route file at `app/api/your-endpoint/route.ts`:

```typescript
// app/api/your-endpoint/route.ts
import { NextResponse } from "next/server"
import { isLiveKitConfigured, getRoomService } from "@/lib/livekit-server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  if (!isLiveKitConfigured()) {
    return NextResponse.json(
      { error: "LiveKit is not configured." },
      { status: 400 }
    )
  }

  try {
    const svc = getRoomService()
    // ... your logic
    return NextResponse.json({ data: result })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
```

### Step 2: Create a Hook (Optional)

If the endpoint will be polled, create a custom hook in `hooks/`:

```typescript
// hooks/useYourFeature.ts
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

const POLLING_INTERVAL = 4000

export function useYourFeature() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    try {
      setError(null)
      const res = await fetch('/api/your-endpoint', { signal })
      if (signal.aborted) return
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!signal.aborted) setData(json.data)
    } catch (err) {
      if (!signal.aborted) {
        setError(err instanceof Error ? err.message : 'Failed to fetch')
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, POLLING_INTERVAL)
    return () => { clearInterval(interval); abortRef.current?.abort() }
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
```

## Adding a UI Component

### Using shadcn/ui

Add new UI primitives using the shadcn CLI:

```sh
pnpm dlx shadcn@latest add alert-dialog
pnpm dlx shadcn@latest add dropdown-menu
```

Components are added to `components/ui/` and use the `cn()` utility for class merging.

### Creating Custom Components

Place feature-specific components in their own directory:

```
components/
├── your-feature/
│   ├── your-feature-view.tsx    # Main view
│   ├── your-feature-card.tsx    # Reusable card
│   └── your-feature-form.tsx    # Form component
```

## Styling

### Tailwind CSS v4

This project uses Tailwind CSS v4 with CSS-first configuration:

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... more theme variables */
}
```

### Using the `cn()` Utility

Merge Tailwind classes with conditional logic:

```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "base-class padding-4 rounded-lg",
  isActive && "bg-primary text-primary-foreground",
  className  // allow override from props
)} />
```

## Internationalization

### Using Translations

```tsx
import { useI18n } from "@/lib/i18n"

function MyComponent() {
  const { t, locale, dir } = useI18n()
  
  return (
    <div dir={dir}>
      <h1>{t("dashboard.title")}</h1>
      <p>{t("dashboard.subtitle")}</p>
    </div>
  )
}
```

### Adding New Translations

Add keys to both dictionaries in `lib/i18n.tsx`:

```typescript
const en: Dict = {
  // ... existing keys
  "myFeature.title": "My Feature",
  "myFeature.description": "Description of my feature",
}

const fa: Dict = {
  // ... existing keys
  "myFeature.title": "ویژگی من",
  "myFeature.description": "توضیحات ویژگی من",
}
```

### Key Naming Convention

Use dot-notation with feature prefix:

```
feature.section.element  →  "rooms.title", "dashboard.activeRooms"
common.action            →  "common.save", "common.cancel"
nav.item                 →  "nav.dashboard", "nav.rooms"
```

## Data Fetching Patterns

### Polling with AbortController

All data-fetching hooks follow this pattern:

```typescript
const abortRef = useRef<AbortController | null>(null)

const fetchData = useCallback(async () => {
  // 1. Cancel previous request
  abortRef.current?.abort()
  abortRef.current = new AbortController()
  const signal = abortRef.current.signal

  try {
    // 2. Make fetch with signal
    const res = await fetch('/api/endpoint', { signal })
    
    // 3. Check if aborted before updating state
    if (signal.aborted) return
    
    // 4. Update state
    setData(await res.json())
  } catch (err) {
    // 5. Ignore AbortError
    if (err instanceof DOMException && err.name === 'AbortError') return
    setError(err.message)
  }
}, [])

// 6. Initial fetch + polling interval
useEffect(() => {
  fetchData()
  const interval = setInterval(fetchData, INTERVAL)
  return () => { clearInterval(interval); abortRef.current?.abort() }
}, [fetchData])
```

### When to Poll vs. Fetch Once

| Pattern | Use When |
|---------|----------|
| Polling (useRooms, useParticipants) | Data changes frequently (live rooms, participants) |
| Fetch once (useConfig) | Data is static or changes rarely (connection config) |
| On-demand (token generation) | Triggered by user action |

## Environment Variables

### Required Variables

```env
LIVEKIT_URL=http://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
```

### Optional Variables

```env
LIVEKIT_REGION=auto
```

### Adding New Variables

1. Add to `.env.local.example` with a comment
2. Access via `process.env.VARIABLE_NAME`
3. Add to `LiveKitConfig` interface if related to LiveKit

## Testing

There are **no tests** in this repository. To add testing:

### Unit Tests

```sh
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
})
```

### API Route Tests

Test API routes by importing the route handlers directly:

```typescript
import { GET, POST } from './app/api/rooms/route'

test('GET /api/rooms returns rooms', async () => {
  const response = await GET()
  const data = await response.json()
  expect(data.rooms).toBeDefined()
})
```

## Debugging

### Enable Verbose Logging

Add logging to API routes:

```typescript
export async function GET() {
  console.log('Fetching rooms from LiveKit...')
  const rooms = await svc.listRooms()
  console.log(`Found ${rooms.length} rooms`)
  // ...
}
```

### Check LiveKit Connection

Visit `/api/config` directly in the browser to see connection status:

```json
{
  "configured": true,
  "connectionStatus": "connected",
  "roomCount": 3
}
```

### Docker Logs

```sh
cd livekit-server && docker compose logs -f livekit
```

## Common Issues

### "LiveKit is not configured"

1. Verify `.env.local` exists (not just `.env.local.example`)
2. Check that `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` are set
3. Restart the dev server after changing env vars

### CORS Errors

API routes run server-side, so CORS is not an issue for internal fetches. If calling from an external domain, configure CORS in the route:

```typescript
return NextResponse.json(data, {
  headers: { 'Access-Control-Allow-Origin': '*' }
})
```

### TypeScript Errors in Editor

The project has `ignoreBuildErrors: true` in `next.config.mjs`. Editor TypeScript errors are still valid and should be addressed. Common issues:

- Missing type definitions for API responses
- `bigint` to `number` conversions
- Optional chaining on SDK types

### Hot Reload Not Working

1. Check that your file is inside the project directory
2. Ensure you're not editing files in `.next/` or `node_modules/`
3. Restart the dev server: `pnpm dev`

## Deployment

### Vercel (Recommended)

```sh
vercel deploy
```

Set environment variables in the Vercel dashboard:
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_REGION`

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Environment-Specific Configuration

| Environment | LIVEKIT_URL | Notes |
|-------------|-------------|-------|
| Local dev | `http://localhost:7880` | Docker Compose |
| Staging | `wss://staging.livekit.yourdomain.com` | Test server |
| Production | `wss://livekit.yourdomain.com` | Production server |

## Code Conventions

### File Naming

- Components: `kebab-case.tsx` → `dashboard-view.tsx`
- Hooks: `camelCase.ts` → `useRooms.ts`
- API routes: `route.ts` (Next.js convention)
- Utilities: `kebab-case.ts` → `format-date.ts`

### Import Order

```typescript
// 1. External libraries
import { useState } from 'react'
import { RoomServiceClient } from 'livekit-server-sdk'

// 2. Internal imports (by alias)
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// 3. Relative imports
import { formatRoomName } from './utils'
```

### Component Structure

```tsx
"use client"

import { useState } from "react"

// Component
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // 1. Hooks
  const [state, setState] = useState()
  
  // 2. Event handlers
  function handleClick() { }
  
  // 3. Render
  return <div>...</div>
}
```
