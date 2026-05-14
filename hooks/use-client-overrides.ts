'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Client } from '@/lib/types/admin'

const STORAGE_KEY = 'pmfs_client_overrides'
const CHANGE_EVENT = 'pmfs:store-change'

export type ClientOverride = Pick<
  Client,
  'name' | 'email' | 'phone' | 'riskLevel' | 'status' | 'collaboratorAdvisorIds'
>

type Overrides = Record<string, Partial<ClientOverride>>

function readOverrides(): Overrides {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Overrides) : {}
  } catch {
    return {}
  }
}

function writeOverrides(next: Overrides): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key: STORAGE_KEY } }))
}

export function applyClientOverride(client: Client, overrides: Overrides): Client {
  const patch = overrides[client.id]
  if (!patch) return client
  return { ...client, ...patch }
}

/**
 * Allows advisers (and managers) to update key client details from the UI
 * and have the change persist locally. Powers SRD-A04 in this mock-data app
 * without changing the seed data on disk.
 */
export function useClientOverrides() {
  const [overrides, setOverrides] = useState<Overrides>({})

  useEffect(() => {
    setOverrides(readOverrides())
    function handler(event: Event) {
      const detail = (event as CustomEvent<{ key: string }>).detail
      if (!detail || detail.key === STORAGE_KEY) {
        setOverrides(readOverrides())
      }
    }
    window.addEventListener(CHANGE_EVENT, handler as EventListener)
    return () => window.removeEventListener(CHANGE_EVENT, handler as EventListener)
  }, [])

  const update = useCallback((clientId: string, patch: Partial<ClientOverride>) => {
    const current = readOverrides()
    const merged: Overrides = { ...current, [clientId]: { ...current[clientId], ...patch } }
    writeOverrides(merged)
    setOverrides(merged)
  }, [])

  const get = useCallback(
    (clientId: string): Partial<ClientOverride> | undefined => overrides[clientId],
    [overrides],
  )

  return { overrides, update, get }
}
