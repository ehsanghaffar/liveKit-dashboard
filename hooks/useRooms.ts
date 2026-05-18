'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { Room } from '@/lib/mock-data'

interface UseRoomsReturn {
  rooms: Room[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const POLLING_INTERVAL = 4000

export function useRooms(): UseRoomsReturn {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchRooms = useCallback(async () => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal
    try {
      setError(null)
      const res = await fetch('/api/rooms', { signal })
      if (signal.aborted) return
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (!signal.aborted) setRooms(data.rooms || [])
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      if (!signal.aborted) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rooms')
        setRooms([])
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
    return () => { abortRef.current?.abort() }
  }, [fetchRooms])

  useEffect(() => {
    const interval = setInterval(fetchRooms, POLLING_INTERVAL)
    return () => {
      clearInterval(interval)
      abortRef.current?.abort()
    }
  }, [fetchRooms])

  return { rooms, loading, error, refetch: fetchRooms }
}
