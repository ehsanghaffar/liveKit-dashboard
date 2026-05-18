'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Room } from '@/lib/mock-data'

interface UseRoomsReturn {
  rooms: Room[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const POLLING_INTERVAL = 4000 // 4 seconds

/**
 * Hook to fetch and poll LiveKit rooms
 * Automatically refetches at regular intervals
 */
export function useRooms(): UseRoomsReturn {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/rooms')
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setRooms(data.rooms || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms')
      setRooms([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  // Setup polling interval
  useEffect(() => {
    const interval = setInterval(fetchRooms, POLLING_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchRooms])

  return { rooms, loading, error, refetch: fetchRooms }
}
