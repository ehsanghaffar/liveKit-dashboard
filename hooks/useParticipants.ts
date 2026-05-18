'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { Participant } from '@/lib/mock-data'

interface UseParticipantsReturn {
  participants: Participant[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const POLLING_INTERVAL = 3000

export function useParticipants(roomName: string | undefined): UseParticipantsReturn {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(!roomName)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchParticipants = useCallback(async () => {
    if (!roomName) {
      setParticipants([])
      setLoading(false)
      return
    }

    abortRef.current?.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal
    try {
      setError(null)
      const encodedRoom = encodeURIComponent(roomName)
      const res = await fetch(`/api/rooms/${encodedRoom}`, { signal })
      if (signal.aborted) return
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (!signal.aborted) setParticipants(data.participants || [])
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      if (!signal.aborted) {
        setError(err instanceof Error ? err.message : 'Failed to fetch participants')
        setParticipants([])
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [roomName])

  useEffect(() => {
    fetchParticipants()
    return () => { abortRef.current?.abort() }
  }, [fetchParticipants])

  useEffect(() => {
    if (!roomName) return
    const interval = setInterval(fetchParticipants, POLLING_INTERVAL)
    return () => {
      clearInterval(interval)
      abortRef.current?.abort()
    }
  }, [roomName, fetchParticipants])

  return { participants, loading, error, refetch: fetchParticipants }
}
