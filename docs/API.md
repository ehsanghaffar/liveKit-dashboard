# API Reference

This document describes the backend routes used by the LiveKit Dashboard.

## Common behavior

- All API routes use Next.js App Router route handlers.
- `dynamic = "force-dynamic"` and `runtime = "nodejs"` are enabled for server-side execution.
- Most LiveKit routes return a `400` or `401` error when LiveKit is not configured.
- `GET /api/rooms` and some read-only routes return mock data when LiveKit is not configured.

---

## `GET /api/config`

Returns LiveKit environment readiness.

### Response

```json
{
  "configured": true,
  "url": "http://localhost:7880",
  "hasApiKey": true,
  "hasApiSecret": true
}
```

### Notes

- Uses `getLiveKitConfig()` and `isLiveKitConfigured()` from `lib/livekit-server`.
- Useful for UI health checks and conditional mock mode.

---

## `POST /api/tokens`

Mints a LiveKit access token.

### Request body

```json
{
  "identity": "operator-1",
  "name": "Dashboard User",
  "ttlSeconds": 3600,
  "room": "my-room"
}
```

### Response

```json
{
  "token": "<jwt-token>",
  "url": "http://localhost:7880",
  "identity": "operator-1",
  "expiresIn": 21600
}
```

### Errors

- `400` when LiveKit is not configured
- `400` when `identity` is missing
- `500` on unexpected token creation errors

---

## `GET /api/rooms`

Returns a list of rooms.

### Success response

```json
{
  "rooms": [
    {
      "id": "room-1",
      "sid": "...",
      "name": "room-1",
      "participants": 2,
      "publishers": 1,
      "maxParticipants": 0,
      "region": "auto",
      "codec": "VP8",
      "status": "live",
      "createdAt": "2026-05-18T...Z",
      "durationSeconds": 123,
      "recording": false,
      "metadata": ""
    }
  ],
  "mock": false
}
```

### Mock behavior

- If LiveKit is not configured, the endpoint returns `mockRooms` and sets `mock: true`.

---

## `POST /api/rooms`

Creates a new LiveKit room.

### Request body

```json
{
  "name": "engineering-standup",
  "emptyTimeout": 300,
  "departureTimeout": 20,
  "maxParticipants": 0,
  "metadata": ""
}
```

### Response

```json
{
  "room": {
    "sid": "...",
    "name": "engineering-standup"
  }
}
```

### Errors

- `400` when LiveKit is not configured
- `400` when `name` is missing
- `500` on creation failure

---

## `GET /api/rooms/[name]`

Lists participants for a specific room.

### Response

```json
{
  "room": "engineering-standup",
  "participants": [
    {
      "id": "...",
      "sid": "...",
      "identity": "alice",
      "name": "alice",
      "role": "publisher",
      "audio": true,
      "video": true,
      "screen": false,
      "bitrateKbps": 0,
      "quality": "good",
      "device": "unknown",
      "browser": "unknown",
      "region": "auto",
      "pingMs": 0,
      "packetLoss": 0,
      "joinedAt": "2026-05-18T...Z",
      "state": "connected",
      "metadata": "",
      "tracks": [
        {
          "sid": "...",
          "type": 1,
          "source": 2,
          "muted": false,
          "name": "camera",
          "mimeType": "video/h264"
        }
      ]
    }
  ],
  "mock": false
}
```

### Mock behavior

- Returns `mockParticipants` when LiveKit is not configured.

---

## `DELETE /api/rooms/[name]`

Deletes a room or removes a participant.

### Query parameters

- `identity` (optional) — if provided, removes that participant from the room

### Response

```json
{ "ok": true }
```

### Errors

- `400` when LiveKit is not configured
- `500` on delete/remove failure

---

## `POST /api/rooms/[name]/participants/[identity]/tracks/[trackSid]/mute`

Mutes or unmutes a published participant track.

### Request body

```json
{ "muted": true }
```

### Response

```json
{ "ok": true }
```

### Notes

- The route uses `getRoomService().mutePublishedTrack(...)`.
- It requires LiveKit to be configured.

---

## `GET /api/egress`

Returns current egress sessions.

### Response

```json
{
  "egresses": [
    {
      "egressId": "...",
      "roomName": "engineering-standup",
      "roomId": "...",
      "status": "started",
      "startedAt": 1680000000,
      "endedAt": 0,
      "error": ""
    }
  ],
  "mock": false
}
```

### Mock behavior

- Returns `{ egresses: [], mock: true }` when LiveKit is not configured.

---

## `POST /api/egress`

Starts or stops egress recording.

### Request body examples

Start egress:

```json
{
  "action": "start",
  "roomName": "engineering-standup",
  "filepath": "recordings/engineering-standup-{time}.mp4",
  "audioOnly": false
}
```

Stop egress:

```json
{
  "action": "stop",
  "egressId": "..."
}
```

### Response

```json
{
  "ok": true,
  "egress": {
    "egressId": "...",
    "status": "starting",
    "roomName": "engineering-standup"
  }
}
```

### Errors

- `400` when LiveKit is not configured
- `400` on invalid request shape
- `500` on egress failure

---

## `POST /api/webhooks/livekit`

Receives signed LiveKit webhook events.

### Requirements

- `Content-Type: application/webhook+json`
- Authorization header with the signed webhook JWT

### Behavior

- Uses `getWebhookReceiver()` to validate signatures
- Stores events in memory using `recordWebhookEvent()`

### Response
n
```json
{ "ok": true }
```

### Errors

- `400` when LiveKit is not configured
- `401` when validation fails
- `500` on processing errors

---

## Notes for Developers

- The app currently includes a demo-style login page and does not enforce real authentication.
- For production, swap `lib/webhook-store.ts` to a persistent store.
- The API is designed for operator tooling rather than public client consumption.
