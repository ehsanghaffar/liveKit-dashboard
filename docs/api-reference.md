# API Reference

All API routes run on the Node.js runtime (`runtime: "nodejs"`) with dynamic rendering (`dynamic: "force-dynamic"`). They server-side call the LiveKit Server SDK and return JSON responses.

## Base URL

When running locally: `http://localhost:3000/api`

---

## Configuration

### `GET /api/config`

Returns the current LiveKit connection status and configuration details.

**Authentication:** None

**Response:** `200 OK`

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

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `configured` | boolean | Whether all required env vars are set |
| `url` | string | LiveKit server URL |
| `hasApiKey` | boolean | Whether API key is present |
| `hasApiSecret` | boolean | Whether API secret is present |
| `region` | string | Region identifier |
| `connectionStatus` | string | `"connected"`, `"error"`, `"not_configured"`, or `"unknown"` |
| `roomCount` | number | Number of active rooms (only when connected) |
| `error` | string | Error message if connection failed |

**Connection Status Values:**

| Status | Meaning |
|--------|---------|
| `connected` | Successfully connected to LiveKit server |
| `error` | Configured but connection failed (see `error` field) |
| `not_configured` | Missing required environment variables |
| `unknown` | Connection not yet attempted |

**Used by:** `useConfig()` hook on the dashboard page.

---

## Rooms

### `GET /api/rooms`

Lists all active rooms on the LiveKit server.

**Authentication:** None (relies on server-side env vars)

**Response:** `200 OK`

```json
{
  "rooms": [
    {
      "id": "RM_abc123",
      "sid": "RM_abc123",
      "name": "meeting-room-1",
      "participants": 4,
      "publishers": 2,
      "maxParticipants": 20,
      "region": "auto",
      "codec": "VP8",
      "bitrate": 0,
      "status": "live",
      "createdAt": "2026-05-19T10:00:00.000Z",
      "durationSeconds": 3600,
      "recording": false,
      "metadata": ""
    }
  ]
}
```

**Error Response:** `400 Bad Request`

```json
{ "error": "LiveKit is not configured." }
```

**Error Response:** `500 Internal Server Error`

```json
{ "error": "Connection refused" }
```

**Used by:** `useRooms()` hook (polls every 4 seconds).

---

### `POST /api/rooms`

Creates a new room on the LiveKit server.

**Request Body:**

```json
{
  "name": "new-room",
  "emptyTimeout": 300,
  "departureTimeout": 20,
  "maxParticipants": 0,
  "metadata": ""
}
```

**Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | Yes | — | Unique room name |
| `emptyTimeout` | number | No | 300 | Seconds to keep room alive after last participant leaves |
| `departureTimeout` | number | No | 20 | Seconds to keep room alive after last publisher leaves |
| `maxParticipants` | number | No | 0 | Maximum participants (0 = unlimited) |
| `metadata` | string | No | `""` | Arbitrary metadata string |

**Response:** `200 OK`

```json
{
  "room": {
    "sid": "RM_xyz789",
    "name": "new-room"
  }
}
```

**Error Response:** `400 Bad Request`

```json
{ "error": "Room name is required." }
```

**Example:**

```sh
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "standup-meeting"}'
```

---

### `GET /api/rooms/:name`

Lists all participants in a specific room.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Room name (URL-encoded if necessary) |

**Response:** `200 OK`

```json
{
  "room": "meeting-room-1",
  "participants": [
    {
      "id": "PA_abc123",
      "sid": "PA_abc123",
      "identity": "user-123",
      "name": "John Doe",
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
      "joinedAt": "2026-05-19T10:05:00.000Z",
      "state": {},
      "metadata": "",
      "tracks": [
        {
          "sid": "TR_audio1",
          "type": 0,
          "source": 1,
          "muted": false,
          "name": "audio",
          "mimeType": "audio/opus"
        }
      ]
    }
  ]
}
```

**Participant Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `identity` | string | Unique participant identifier |
| `name` | string | Display name (falls back to identity) |
| `role` | string | `"publisher"` or `"viewer"` |
| `audio` | boolean | Has active audio track |
| `video` | boolean | Has active video track |
| `screen` | boolean | Is screen sharing |
| `tracks` | array | List of published tracks with details |

**Track Types:**

| `type` | Meaning |
|--------|---------|
| 0 | Audio |
| 1 | Video |

**Track Sources:**

| `source` | Meaning |
|----------|---------|
| 0 | Unknown |
| 1 | Camera |
| 2 | Microphone |
| 3 | Screen share |

**Used by:** `useParticipants()` hook (polls every 3 seconds).

---

### `DELETE /api/rooms/:name`

Deletes a room or removes a specific participant.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Room name |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `identity` | string | (Optional) Participant identity to remove. If omitted, deletes the entire room. |

**Delete Room Response:** `200 OK`

```json
{ "ok": true }
```

**Remove Participant Response:** `200 OK`

```json
{ "ok": true }
```

**Examples:**

```sh
# Delete entire room
curl -X DELETE http://localhost:3000/api/rooms/meeting-room-1

# Remove specific participant
curl -X DELETE "http://localhost:3000/api/rooms/meeting-room-1?identity=user-123"
```

---

## Tokens

### `POST /api/tokens`

Generates a signed JWT access token for a participant to join a room.

**Request Body:**

```json
{
  "identity": "user-123",
  "room": "meeting-room-1",
  "canPublish": true,
  "canSubscribe": true,
  "canPublishData": false,
  "ttlSeconds": 3600,
  "name": "John Doe"
}
```

**Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `identity` | string | Yes | — | Unique participant identifier |
| `room` | string | No | `""` | Room name to join |
| `canPublish` | boolean | No | `false` | Allow publishing audio/video tracks |
| `canSubscribe` | boolean | No | `false` | Allow subscribing to other participants' tracks |
| `canPublishData` | boolean | No | `false` | Allow publishing data messages |
| `ttlSeconds` | number | No | 21600 (6 hours) | Token time-to-live in seconds |
| `name` | string | No | — | Display name for the participant |

**Response:** `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6Im1lZXRpbmctcm9vbS0xIiwiY2FuUHVibGlzaCI6dHJ1ZSwiY2FuU3Vic2NyaWJlIjp0cnVlLCJjYW5QdWJsaXNoRGF0YSI6ZmFsc2V9LCJpc3MiOiJkZXZrZXkiLCJzdWIiOiJ1c2VyLTEyMyIsIm5hbWUiOiJKb2huIERvZSIsImV4cCI6MTcxNjEwMDAwMH0.abc123signature",
  "url": "http://localhost:7880",
  "identity": "user-123",
  "expiresIn": 3600
}
```

**Error Response:** `400 Bad Request`

```json
{ "error": "identity is required." }
```

**Error Response:** `400 Bad Request`

```json
{ "error": "LiveKit is not configured." }
```

**Example:**

```sh
curl -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "viewer-456",
    "room": "webinar-room",
    "canSubscribe": true,
    "ttlSeconds": 7200
  }'
```

**Using the Token:**

The generated token can be used with the LiveKit client SDK to connect to a room:

```javascript
import { Room } from 'livekit-client'

const room = new Room()
await room.connect('http://localhost:7880', 'eyJhbGciOiJIUzI1NiIs...')
```

---

## Egress (Recording)

### `GET /api/egress`

Lists all active and completed recording sessions.

**Response:** `200 OK`

```json
{
  "egresses": [
    {
      "egressId": "EG_abc123",
      "roomName": "meeting-room-1",
      "roomId": "RM_abc123",
      "status": "EGRESS_ACTIVE",
      "startedAt": 1716090000000,
      "endedAt": 0,
      "error": null
    }
  ],
  "mock": false
}
```

**Egress Status Values:**

| Status | Meaning |
|--------|---------|
| `EGRESS_STARTING` | Recording is initializing |
| `EGRESS_ACTIVE` | Recording is in progress |
| `EGRESS_ENDING` | Recording is stopping |
| `EGRESS_COMPLETE` | Recording finished successfully |
| `EGRESS_FAILED` | Recording failed (see `error` field) |

**Used by:** `useEgress()` hook (polls every 5 seconds).

---

### `POST /api/egress`

Starts or stops a room recording.

**Request Body — Start Recording:**

```json
{
  "action": "start",
  "roomName": "meeting-room-1",
  "filepath": "recordings/meeting-room-1-{time}.mp4",
  "audioOnly": false
}
```

**Request Body — Stop Recording:**

```json
{
  "action": "stop",
  "egressId": "EG_abc123"
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | `"start"` or `"stop"` |
| `roomName` | string | Yes (for start) | Room to record |
| `egressId` | string | Yes (for stop) | Egress session ID to stop |
| `filepath` | string | No | Output file path pattern (supports `{time}` placeholder) |
| `audioOnly` | boolean | No | Record audio only (default: false) |

**Start Response:** `200 OK`

```json
{
  "ok": true,
  "egress": {
    "egressId": "EG_xyz789",
    "status": "EGRESS_STARTING",
    "roomName": "meeting-room-1"
  }
}
```

**Stop Response:** `200 OK`

```json
{
  "ok": true,
  "egress": {
    "egressId": "EG_abc123",
    "status": "EGRESS_ENDING"
  }
}
```

**Recording Details:**

- Output format: MP4
- Encoding: H.264 720p @ 30fps
- Layout: Speaker view
- Default filepath pattern: `recordings/{roomName}-{time}.mp4`

**Examples:**

```sh
# Start recording
curl -X POST http://localhost:3000/api/egress \
  -H "Content-Type: application/json" \
  -d '{"action":"start","roomName":"webinar"}'

# Stop recording
curl -X POST http://localhost:3000/api/egress \
  -H "Content-Type: application/json" \
  -d '{"action":"stop","egressId":"EG_abc123"}'
```

---

## Webhooks

### `POST /api/webhooks/livekit`

Receives webhook events from the LiveKit server.

**Configure your LiveKit server** to send webhook events to this endpoint:

```yaml
# In your LiveKit server config
webhook:
  urls:
    - http://your-domain/api/webhooks/livekit
```

**Headers:**

| Header | Value | Description |
|--------|-------|-------------|
| `Content-Type` | `application/webhook+json` | Required |
| `Authorization` | `<JWT>` | Signed with your API key/secret |

**Request Body:** Raw webhook JSON payload from LiveKit server.

**Response:** `200 OK`

```json
{ "ok": true }
```

**Error Response:** `401 Unauthorized`

```json
{ "error": "Invalid webhook" }
```

**Local Development:**

For local development, use a tunnel service to expose your localhost:

```sh
ngrok http 3000
# Then configure LiveKit webhook URL to: https://abc123.ngrok.io/api/webhooks/livekit
```

**Event Storage:**

Received events are stored in-memory (max 500) and can be retrieved via `GET /api/events`.

---

### `GET /api/webhooks/livekit`

Returns informational response about the webhook endpoint.

**Response:** `200 OK`

```json
{
  "info": "POST LiveKit webhook events here. Set Content-Type: application/webhook+json."
}
```

---

## Events

### `GET /api/events`

Returns the list of recorded webhook events.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 100 | Maximum number of events to return |

**Response:** `200 OK`

```json
{
  "events": [
    {
      "id": "evt_abc123",
      "event": "room_started",
      "createdAt": 1716090000,
      "room": "meeting-room-1",
      "participant": null,
      "raw": {
        "event": "room_started",
        "room": { "name": "meeting-room-1", "sid": "RM_abc123" }
      }
    }
  ]
}
```

**Common Event Types:**

| Event | Description |
|-------|-------------|
| `room_started` | A new room was created |
| `room_finished` | A room was deleted |
| `participant_joined` | A participant joined a room |
| `participant_left` | A participant left a room |
| `track_published` | A track was published |
| `track_unpublished` | A track was unpublished |
| `egress_started` | A recording session started |
| `egress_ended` | A recording session ended |

**Note:** Events are stored in-memory and reset on every redeploy. For production, persist to a database.

---

## Monitoring

### `GET /api/monitoring`

Returns system metrics and health information.

**Response:** `200 OK`

```json
{
  "cpu": 45.2,
  "memory": 68.1,
  "disk": 32.5,
  "network": {
    "in": 1250,
    "out": 3400
  }
}
```

---

## Error Handling

All API routes follow a consistent error response format:

```json
{
  "error": "Human-readable error message"
}
```

**HTTP Status Codes:**

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (missing params, not configured) |
| 401 | Unauthorized (invalid webhook signature) |
| 500 | Internal server error (LiveKit connection failed) |

---

## Rate Limiting

There is **no rate limiting** implemented in this starter template. For production, consider:

- Adding rate limiting middleware (e.g., `@upstash/ratelimit`)
- Using a reverse proxy with rate limiting (nginx, Cloudflare)
- Implementing per-IP or per-token rate limits
