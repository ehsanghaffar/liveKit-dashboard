'use client'

import { useEffect, useState, useCallback } from 'react'

export interface LiveKitConfigStatus {
  configured: boolean
  url: string | null
  hasApiKey: boolean
  hasApiSecret: boolean
  region: string
  connectionStatus: "connected" | "error" | "not_configured" | "unknown"
  roomCount: number
  error: string | null
}

interface UseConfigReturn {
  config: LiveKitConfigStatus | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch LiveKit configuration status (one-time fetch)
 * Configuration is static during the app lifecycle
 */
export function useConfig(): UseConfigReturn {
  const [config, setConfig] = useState<LiveKitConfigStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/config')

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setConfig(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch config')
      setConfig(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Single fetch on mount
  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  return { config, loading, error, refetch: fetchConfig }
}
