'use client'

import { useEffect, useState, useCallback } from 'react'

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

const POLLING_INTERVAL = 5000 // 5 seconds

/**
 * Hook to fetch and poll active egress (recording) sessions
 * Automatically refetches at regular intervals
 */
export function useEgress(): UseEgressReturn {
  const [egresses, setEgresses] = useState<EgressSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEgress = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/egress')

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setEgresses(data.egresses || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch egress sessions')
      setEgresses([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchEgress()
  }, [fetchEgress])

  // Setup polling interval
  useEffect(() => {
    const interval = setInterval(fetchEgress, POLLING_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchEgress])

  return { egresses, loading, error, refetch: fetchEgress }
}
