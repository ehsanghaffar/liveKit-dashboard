/**
 * LiveKit Server SDK Configuration & Initialization
 *
 * This module initializes and manages LiveKit SDK clients for:
 * - Room management (RoomServiceClient)
 * - Access token generation (AccessToken)
 * - Webhook validation (WebhookReceiver)
 * - Egress recording (EgressClient)
 *
 * All clients require LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET env vars.
 */

import {
  AccessToken,
  RoomServiceClient,
  WebhookReceiver,
  EgressClient,
  type VideoGrant,
} from 'livekit-server-sdk'

// Configuration interface
export interface LiveKitConfig {
  url: string | undefined
  apiKey: string | undefined
  apiSecret: string | undefined
  region: string
}

// Token grants interface for creating access tokens
export interface TokenGrants {
  identity: string
  room?: string
  canPublish?: boolean
  canSubscribe?: boolean
  canPublishData?: boolean
  ttlSeconds?: number
  name?: string
}

/**
 * Get LiveKit configuration from environment variables
 */
export function getLiveKitConfig(): LiveKitConfig {
  return {
    url: process.env.LIVEKIT_URL,
    apiKey: process.env.LIVEKIT_API_KEY,
    apiSecret: process.env.LIVEKIT_API_SECRET,
    region: process.env.LIVEKIT_REGION ?? 'auto',
  }
}

/**
 * Check if LiveKit is properly configured
 */
export function isLiveKitConfigured(): boolean {
  const cfg = getLiveKitConfig()
  return Boolean(cfg.url && cfg.apiKey && cfg.apiSecret)
}

/**
 * Get or create RoomServiceClient singleton
 * Used for: listRooms, deleteRoom, listParticipants, removeParticipant, mutePublishedTrack
 */
let roomServiceInstance: RoomServiceClient | null = null

export function getRoomService(): RoomServiceClient {
  if (roomServiceInstance) {
    return roomServiceInstance
  }

  const cfg = getLiveKitConfig()
  if (!isLiveKitConfigured()) {
    throw new Error('LiveKit is not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.')
  }

  roomServiceInstance = new RoomServiceClient(cfg.url!, cfg.apiKey, cfg.apiSecret)
  return roomServiceInstance
}

/**
 * Get or create EgressClient singleton
 * Used for: listEgress, startRoomCompositeEgress, stopEgress
 */
let egressClientInstance: EgressClient | null = null

export function getEgressClient(): EgressClient {
  if (egressClientInstance) {
    return egressClientInstance
  }

  const cfg = getLiveKitConfig()
  if (!isLiveKitConfigured()) {
    throw new Error('LiveKit is not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.')
  }

  egressClientInstance = new EgressClient(cfg.url!, cfg.apiKey, cfg.apiSecret)
  return egressClientInstance
}

/**
 * Get or create WebhookReceiver singleton
 * Used for: receive and validate LiveKit webhook events
 */
let webhookReceiverInstance: WebhookReceiver | null = null

export function getWebhookReceiver(): WebhookReceiver {
  if (webhookReceiverInstance) {
    return webhookReceiverInstance
  }

  const cfg = getLiveKitConfig()
  if (!isLiveKitConfigured()) {
    throw new Error('LiveKit is not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET.')
  }

  webhookReceiverInstance = new WebhookReceiver(cfg.apiKey!, cfg.apiSecret!)
  return webhookReceiverInstance
}

/**
 * Create an access token for a participant to join a room
 *
 * @param grants Token grants (identity, room, permissions, ttl)
 * @returns JWT token string
 *
 * Example:
 *   const token = await createAccessToken({
 *     identity: 'user-123',
 *     room: 'my-room',
 *     canPublish: true,
 *     canSubscribe: true,
 *     ttlSeconds: 3600,
 *   })
 */
export async function createAccessToken(grants: TokenGrants): Promise<string> {
  const cfg = getLiveKitConfig()
  if (!isLiveKitConfigured()) {
    throw new Error('LiveKit is not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET.')
  }

  if (!grants.identity) {
    throw new Error('Token grants must include identity.')
  }

  const at = new AccessToken(cfg.apiKey, cfg.apiSecret, {
    identity: grants.identity,
    name: grants.name,
    ttl: grants.ttlSeconds ? Math.floor(grants.ttlSeconds) : 6 * 60 * 60, // default 6 hours
  })

  // Build video grant with room and permissions
  const videoGrant: VideoGrant = {
    roomJoin: true,
    room: grants.room || '',
    canPublish: grants.canPublish !== false, // default true
    canSubscribe: grants.canSubscribe !== false, // default true
    canPublishData: grants.canPublishData === true, // default false
  }

  at.addGrant(videoGrant)

  return await at.toJwt()
}
