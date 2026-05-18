'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface EgressSession {
  egressId: string
  roomName: string
  roomId?: string
  status: string
  startedAt: number
  endedAt: number
  error?: string
}

interface UseEgressReturn {
  egresses: EgressSession[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const POLLING_INTERVAL = 5000

export function useEgress(): UseEgressReturn {
  const [egresses, setEgresses] = useState<EgressSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchEgress = useCallback(async () => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal
    try {
      setError(null)
      const res = await fetch('/api/egress', { signal })
      if (signal.aborted) return
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (!signal.aborted) setEgresses(data.egresses || [])
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      if (!signal.aborted) {
        setError(err instanceof Error ? err.message : 'Failed to fetch egress sessions')
        setEgresses([])
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEgress()
    return () => { abortRef.current?.abort() }
  }, [fetchEgress])

  useEffect(() => {
    const interval = setInterval(fetchEgress, POLLING_INTERVAL)
    return () => {
      clearInterval(interval)
      abortRef.current?.abort()
    }
  }, [fetchEgress])

  return { egresses, loading, error, refetch: fetchEgress }
}
