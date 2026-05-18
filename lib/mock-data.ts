/**
 * Type definitions for LiveKit dashboard entities
 *
 * These types are used throughout the dashboard and API layer
 * for representing rooms, participants, services, and logs from LiveKit.
 */

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

