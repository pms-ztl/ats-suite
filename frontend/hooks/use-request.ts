"use client"

import { useState, useCallback } from "react"

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false"

function getToken(): string | null {
  if (typeof document === "undefined") return null
  const m = document.cookie.match(/ats-token=([^;]+)/)
  return m ? m[1] : null
}

export async function apiRequest<T = any>(
  method: string,
  path: string,
  body?: unknown
): Promise<T | null> {
  if (USE_MOCKS) return null
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export function useRequest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async <T = any>(
      method: string,
      path: string,
      body?: unknown
    ): Promise<T | null> => {
      setLoading(true)
      setError(null)
      try {
        const result = await apiRequest<T>(method, path, body)
        return result
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Request failed"
        setError(msg)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { execute, loading, error, isMockMode: USE_MOCKS }
}
