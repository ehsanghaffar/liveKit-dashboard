export type RoomStatus = "live" | "idle" | "ending"

export type Room = {
  id: string
  name: string
  participants: number
  maxParticipants: number
  region: string
  codec: "VP8" | "VP9" | "H.264" | "AV1"
  bitrate: number // kbps
  status: RoomStatus
  createdAt: string
  durationSeconds: number
  recording: boolean
}

export type Participant = {
  id: string
  identity: string
  name: string
  role: "publisher" | "viewer" | "admin"
  audio: boolean
  video: boolean
  screen: boolean
  bitrateKbps: number
  quality: "excellent" | "good" | "poor"
  device: string
  browser: string
  region: string
  pingMs: number
  packetLoss: number
  joinedAt: string
}

export type ServiceStatus = {
  id: string
  name: string
  status: "healthy" | "degraded" | "down"
  version: string
  uptime: string
  containerId?: string
}

export type LogLevel = "debug" | "info" | "warn" | "error"

export type LogEntry = {
  id: string
  ts: string
  level: LogLevel
  service: string
  message: string
  meta?: Record<string, unknown>
}

const REGIONS = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1", "me-central-1"]
const ROOM_NAMES = [
  "town-hall-q4",
  "engineering-standup",
  "design-critique",
  "support-room-12",
  "webinar-product-launch",
  "interview-frontend",
  "podcast-studio-a",
  "classroom-101",
  "live-shopping-demo",
  "sales-discovery",
]

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateRooms(count = 12): Room[] {
  return Array.from({ length: count }).map((_, i) => {
    const duration = rand(60, 14400)
    return {
      id: `RM_${(i + 1).toString().padStart(4, "0")}_${Math.random().toString(36).slice(2, 8)}`,
      name: ROOM_NAMES[i % ROOM_NAMES.length] + (i >= ROOM_NAMES.length ? `-${i}` : ""),
      participants: rand(2, 240),
      maxParticipants: 500,
      region: pick(REGIONS),
      codec: pick(["VP8", "VP9", "H.264", "AV1"]),
      bitrate: rand(400, 4800),
      status: pick(["live", "live", "live", "idle", "ending"]),
      createdAt: new Date(Date.now() - duration * 1000).toISOString(),
      durationSeconds: duration,
      recording: Math.random() > 0.6,
    }
  })
}

export function generateParticipants(count = 14): Participant[] {
  const names = [
    "Sara Ahmadi",
    "Liam Chen",
    "Noah Williams",
    "Olivia Park",
    "Reza Karimi",
    "Mia Rossi",
    "Ethan Müller",
    "Aria Tanaka",
    "Yusuf Demir",
    "Zara Khan",
    "Diego Silva",
    "Hana Kim",
    "Marco Bianchi",
    "Layla Nasser",
  ]
  return Array.from({ length: count }).map((_, i) => ({
    id: `PA_${i.toString().padStart(4, "0")}`,
    identity: `user_${Math.random().toString(36).slice(2, 9)}`,
    name: names[i % names.length],
    role: pick(["publisher", "viewer", "admin"]) as Participant["role"],
    audio: Math.random() > 0.2,
    video: Math.random() > 0.4,
    screen: Math.random() > 0.85,
    bitrateKbps: rand(120, 3200),
    quality: pick(["excellent", "excellent", "good", "good", "poor"]) as Participant["quality"],
    device: pick(["MacBook Pro", "iPhone 15", "Pixel 8", "Windows PC", "iPad", "Linux"]),
    browser: pick(["Chrome 124", "Safari 17", "Firefox 126", "Edge 124"]),
    region: pick(REGIONS),
    pingMs: rand(8, 220),
    packetLoss: Math.round(Math.random() * 30) / 10,
    joinedAt: new Date(Date.now() - rand(30, 7200) * 1000).toISOString(),
  }))
}

export function generateServices(): ServiceStatus[] {
  return [
    { id: "livekit", name: "LiveKit Server", status: "healthy", version: "1.7.2", uptime: "12d 4h", containerId: "lk_a1b2c3" },
    { id: "redis", name: "Redis", status: "healthy", version: "7.2.4", uptime: "12d 4h", containerId: "rd_88f1e2" },
    { id: "turn", name: "TURN / STUN", status: "healthy", version: "coturn 4.6.2", uptime: "12d 4h", containerId: "tr_55a9b2" },
    { id: "api", name: "API Gateway", status: "healthy", version: "2.4.0", uptime: "8d 11h", containerId: "ap_71c2d4" },
    { id: "ws", name: "WebSocket", status: "degraded", version: "1.7.2", uptime: "1d 2h", containerId: "ws_3a8e1f" },
    { id: "egress", name: "Egress Worker", status: "healthy", version: "1.8.1", uptime: "5d 9h", containerId: "eg_99cc11" },
  ]
}

const LOG_MESSAGES: { level: LogLevel; service: string; message: string }[] = [
  { level: "info", service: "livekit", message: "Participant joined room" },
  { level: "info", service: "livekit", message: "Track published: video/h264 1080p" },
  { level: "warn", service: "turn", message: "TURN allocation request slow (412ms)" },
  { level: "info", service: "api", message: "Token issued for identity user_8f2a1b" },
  { level: "error", service: "livekit", message: "ICE candidate gathering failed for participant" },
  { level: "info", service: "redis", message: "AOF rewrite completed" },
  { level: "debug", service: "ws", message: "Heartbeat ping 32ms" },
  { level: "warn", service: "livekit", message: "High packet loss detected on transport" },
  { level: "info", service: "egress", message: "Recording started for room webinar-product-launch" },
  { level: "info", service: "livekit", message: "Room created: engineering-standup" },
]

export function generateLogs(count = 80): LogEntry[] {
  return Array.from({ length: count }).map((_, i) => {
    const m = pick(LOG_MESSAGES)
    return {
      id: `LG_${i.toString().padStart(5, "0")}`,
      ts: new Date(Date.now() - i * rand(800, 4000)).toISOString(),
      level: m.level,
      service: m.service,
      message: m.message,
      meta: { room: pick(ROOM_NAMES), node: pick(["lk-1", "lk-2", "lk-3"]) },
    }
  })
}

export function generateTimeSeries(points = 60, base = 50, jitter = 20) {
  let v = base
  return Array.from({ length: points }).map((_, i) => {
    v = Math.max(0, Math.min(100, v + (Math.random() - 0.5) * jitter))
    return {
      t: i,
      label: `${points - i}m`,
      value: Math.round(v),
    }
  })
}

export function generateMultiSeries(points = 60) {
  let cpu = 42, ram = 58, net = 35, participants = 80
  return Array.from({ length: points }).map((_, i) => {
    cpu = Math.max(5, Math.min(95, cpu + (Math.random() - 0.5) * 12))
    ram = Math.max(15, Math.min(92, ram + (Math.random() - 0.5) * 6))
    net = Math.max(0, Math.min(100, net + (Math.random() - 0.5) * 18))
    participants = Math.max(10, Math.min(320, participants + (Math.random() - 0.5) * 30))
    return {
      t: i,
      label: `${points - i}m`,
      cpu: Math.round(cpu),
      ram: Math.round(ram),
      net: Math.round(net),
      participants: Math.round(participants),
    }
  })
}

export function formatDuration(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export function formatBytes(kbps: number) {
  if (kbps >= 1000) return `${(kbps / 1000).toFixed(1)} Mbps`
  return `${kbps} kbps`
}

// Stable mocks shared by API fallbacks when LiveKit env vars aren't set
export const mockRooms: Room[] = generateRooms(12)
export const mockParticipants: Participant[] = generateParticipants(14)
