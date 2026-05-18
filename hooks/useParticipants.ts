'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Participant } from '@/lib/mock-data'

interface UseParticipantsReturn {
  participants: Participant[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const POLLING_INTERVAL = 3000 // 3 seconds

/**
 * Hook to fetch and poll participants in a room
 * Automatically refetches at regular intervals
 *
 * @param roomName - Name of the room to fetch participants from
 */
export function useParticipants(roomName: string | undefined): UseParticipantsReturn {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(!roomName)
  const [error, setError] = useState<string | null>(null)

  const fetchParticipants = useCallback(async () => {
    if (!roomName) {
      setParticipants([])
      setLoading(false)
      return
    }

    try {
      setError(null)
      const encodedRoom = encodeURIComponent(roomName)
      const res = await fetch(`/api/rooms/${encodedRoom}`)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setParticipants(data.participants || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch participants')
      setParticipants([])
    } finally {
      setLoading(false)
    }
  }, [roomName])

  // Initial fetch
  useEffect(() => {
    fetchParticipants()
  }, [fetchParticipants])

  // Setup polling interval (only when roomName is set)
  useEffect(() => {
    if (!roomName) return

    const interval = setInterval(fetchParticipants, POLLING_INTERVAL)
    return () => clearInterval(interval)
  }, [roomName, fetchParticipants])

  return { participants, loading, error, refetch: fetchParticipants }
}
