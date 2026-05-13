/**
 * LocalStorage-backed mutable data store and React hooks.
 *
 * This satisfies the "MUST allow users to record / create / edit / delete"
 * requirements throughout the SRD without introducing a real backend.
 * When integrated into the host repo with real auth and APIs, the same
 * hooks can be swapped to call those APIs while the call-sites stay the same.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import type {
  AppNotification,
  ConsultationRecord,
  ConsultationRequest,
  ConsultationResponse,
  DataSharingConsent,
  UserCategory,
  UserTransaction,
} from '@/lib/types/store'

// ─── Storage keys ─────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  transactions: 'pmfs_user_transactions',
  categories: 'pmfs_user_categories',
  requests: 'pmfs_consultation_requests',
  consultations: 'pmfs_consultation_records',
  consents: 'pmfs_data_consents',
  notifications: 'pmfs_notifications',
} as const

const CHANGE_EVENT = 'pmfs:store-change'

// ─── Generic helpers ──────────────────────────────────────────────────────────

function readArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

function writeArray<T>(key: string, value: T[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }))
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function useStorageList<T>(key: string): [T[], (next: T[]) => void] {
  const [items, setItems] = useState<T[]>([])

  useEffect(() => {
    setItems(readArray<T>(key))

    function handler(event: Event) {
      const detail = (event as CustomEvent<{ key: string }>).detail
      if (!detail || detail.key === key) {
        setItems(readArray<T>(key))
      }
    }

    function storageHandler(event: StorageEvent) {
      if (event.key === key) {
        setItems(readArray<T>(key))
      }
    }

    window.addEventListener(CHANGE_EVENT, handler as EventListener)
    window.addEventListener('storage', storageHandler)
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler as EventListener)
      window.removeEventListener('storage', storageHandler)
    }
  }, [key])

  const setAndPersist = useCallback(
    (next: T[]) => {
      writeArray<T>(key, next)
      setItems(next)
    },
    [key],
  )

  return [items, setAndPersist]
}

// ─── User transactions (SRD-U01, U03, U04) ────────────────────────────────────

export function useUserTransactions(clientId?: string) {
  const [all, setAll] = useStorageList<UserTransaction>(STORAGE_KEYS.transactions)
  const items = clientId ? all.filter(item => item.clientId === clientId) : all

  const create = useCallback(
    (input: Omit<UserTransaction, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      const next: UserTransaction = { ...input, id: generateId('UTXN'), createdAt: now, updatedAt: now }
      setAll([next, ...readArray<UserTransaction>(STORAGE_KEYS.transactions)])
      return next
    },
    [setAll],
  )

  const update = useCallback(
    (id: string, patch: Partial<Omit<UserTransaction, 'id' | 'createdAt'>>) => {
      const current = readArray<UserTransaction>(STORAGE_KEYS.transactions)
      setAll(
        current.map(item =>
          item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
        ),
      )
    },
    [setAll],
  )

  const remove = useCallback(
    (id: string) => {
      const current = readArray<UserTransaction>(STORAGE_KEYS.transactions)
      setAll(current.filter(item => item.id !== id))
    },
    [setAll],
  )

  return { transactions: items, create, update, remove }
}

// ─── Custom categories (SRD-U02) ──────────────────────────────────────────────

export function useUserCategories(clientId?: string) {
  const [all, setAll] = useStorageList<UserCategory>(STORAGE_KEYS.categories)
  const items = clientId ? all.filter(item => item.clientId === clientId) : all

  const create = useCallback(
    (input: Omit<UserCategory, 'id' | 'createdAt'>) => {
      const next: UserCategory = { ...input, id: generateId('UCAT'), createdAt: new Date().toISOString() }
      setAll([next, ...readArray<UserCategory>(STORAGE_KEYS.categories)])
      return next
    },
    [setAll],
  )

  const remove = useCallback(
    (id: string) => {
      const current = readArray<UserCategory>(STORAGE_KEYS.categories)
      setAll(current.filter(item => item.id !== id))
    },
    [setAll],
  )

  return { categories: items, create, remove }
}

// ─── Consultation requests (SRD-U07, A06, M03/M07) ────────────────────────────

export function useConsultationRequests() {
  const [all, setAll] = useStorageList<ConsultationRequest>(STORAGE_KEYS.requests)

  const create = useCallback(
    (input: Omit<ConsultationRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'responses'>) => {
      const now = new Date().toISOString()
      const next: ConsultationRequest = {
        ...input,
        id: generateId('REQ'),
        status: 'open',
        responses: [],
        createdAt: now,
        updatedAt: now,
      }
      setAll([next, ...readArray<ConsultationRequest>(STORAGE_KEYS.requests)])
      pushNotification({
        kind: 'request',
        audience: input.assignedAdvisorId ? 'fa' : 'manager',
        audienceUserId: input.assignedAdvisorId,
        title: 'New consultation request',
        message: `${input.clientName} requested help on “${input.topic}”.`,
        href: '/admin/requests',
      })
      return next
    },
    [setAll],
  )

  const update = useCallback(
    (id: string, patch: Partial<Omit<ConsultationRequest, 'id' | 'createdAt' | 'responses'>>) => {
      const current = readArray<ConsultationRequest>(STORAGE_KEYS.requests)
      setAll(
        current.map(item =>
          item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
        ),
      )
    },
    [setAll],
  )

  const respond = useCallback(
    (id: string, response: Omit<ConsultationResponse, 'id' | 'createdAt'>) => {
      const current = readArray<ConsultationRequest>(STORAGE_KEYS.requests)
      setAll(
        current.map(item => {
          if (item.id !== id) return item
          const newResponse: ConsultationResponse = {
            ...response,
            id: generateId('RESP'),
            createdAt: new Date().toISOString(),
          }
          return {
            ...item,
            responses: [...item.responses, newResponse],
            status: response.authorRole === 'customer' ? item.status : 'responded',
            updatedAt: new Date().toISOString(),
          }
        }),
      )
    },
    [setAll],
  )

  const remove = useCallback(
    (id: string) => {
      const current = readArray<ConsultationRequest>(STORAGE_KEYS.requests)
      setAll(current.filter(item => item.id !== id))
    },
    [setAll],
  )

  return { requests: all, create, update, respond, remove }
}

// ─── Consultation records (SRD-A01, A04, A05) ─────────────────────────────────

export function useConsultationRecords(advisorId?: string) {
  const [all, setAll] = useStorageList<ConsultationRecord>(STORAGE_KEYS.consultations)
  const items = advisorId ? all.filter(item => item.advisorId === advisorId) : all

  const create = useCallback(
    (input: Omit<ConsultationRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      const next: ConsultationRecord = {
        ...input,
        id: generateId('CONS'),
        createdAt: now,
        updatedAt: now,
      }
      setAll([next, ...readArray<ConsultationRecord>(STORAGE_KEYS.consultations)])
      return next
    },
    [setAll],
  )

  const update = useCallback(
    (id: string, patch: Partial<Omit<ConsultationRecord, 'id' | 'createdAt'>>) => {
      const current = readArray<ConsultationRecord>(STORAGE_KEYS.consultations)
      setAll(
        current.map(item =>
          item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
        ),
      )
    },
    [setAll],
  )

  const remove = useCallback(
    (id: string) => {
      const current = readArray<ConsultationRecord>(STORAGE_KEYS.consultations)
      setAll(current.filter(item => item.id !== id))
    },
    [setAll],
  )

  return { records: items, create, update, remove }
}

// ─── Data sharing consents (SRD-U08, A02) ─────────────────────────────────────

const DEFAULT_CONSENT: Omit<DataSharingConsent, 'clientId' | 'updatedAt'> = {
  shareWithAdvisor: false,
  shareSpending: false,
  shareBudgets: false,
  shareTransactions: false,
}

export function useDataSharingConsent(clientId: string | undefined) {
  const [all, setAll] = useStorageList<DataSharingConsent>(STORAGE_KEYS.consents)

  const consent: DataSharingConsent = clientId
    ? all.find(item => item.clientId === clientId) ?? {
        clientId,
        ...DEFAULT_CONSENT,
        updatedAt: new Date(0).toISOString(),
      }
    : { clientId: '', ...DEFAULT_CONSENT, updatedAt: new Date(0).toISOString() }

  const update = useCallback(
    (patch: Partial<Omit<DataSharingConsent, 'clientId' | 'updatedAt'>>) => {
      if (!clientId) return
      const current = readArray<DataSharingConsent>(STORAGE_KEYS.consents)
      const existing = current.find(item => item.clientId === clientId)
      const next: DataSharingConsent = {
        ...DEFAULT_CONSENT,
        ...existing,
        ...patch,
        clientId,
        updatedAt: new Date().toISOString(),
      }
      setAll([next, ...current.filter(item => item.clientId !== clientId)])
    },
    [clientId, setAll],
  )

  return { consent, update }
}

export function readConsentSync(clientId: string): DataSharingConsent {
  const all = readArray<DataSharingConsent>(STORAGE_KEYS.consents)
  return (
    all.find(item => item.clientId === clientId) ?? {
      clientId,
      ...DEFAULT_CONSENT,
      updatedAt: new Date(0).toISOString(),
    }
  )
}

// ─── Notifications (SRD-M07) ──────────────────────────────────────────────────

export function pushNotification(input: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
  const notification: AppNotification = {
    ...input,
    id: generateId('NTF'),
    createdAt: new Date().toISOString(),
    read: false,
  }
  const current = readArray<AppNotification>(STORAGE_KEYS.notifications)
  writeArray(STORAGE_KEYS.notifications, [notification, ...current])
  return notification
}

export function useNotifications(audience: 'manager' | 'fa' | 'customer', audienceUserId?: string) {
  const [all, setAll] = useStorageList<AppNotification>(STORAGE_KEYS.notifications)

  const items = all.filter(item => {
    if (item.audience === 'all') return true
    if (item.audience !== audience) return false
    if (item.audienceUserId && audienceUserId && item.audienceUserId !== audienceUserId) return false
    return true
  })

  const markRead = useCallback(
    (id: string) => {
      const current = readArray<AppNotification>(STORAGE_KEYS.notifications)
      setAll(current.map(item => (item.id === id ? { ...item, read: true } : item)))
    },
    [setAll],
  )

  const markAllRead = useCallback(() => {
    const current = readArray<AppNotification>(STORAGE_KEYS.notifications)
    setAll(
      current.map(item => {
        if (item.audience !== audience && item.audience !== 'all') return item
        if (item.audienceUserId && audienceUserId && item.audienceUserId !== audienceUserId) return item
        return { ...item, read: true }
      }),
    )
  }, [setAll, audience, audienceUserId])

  return { notifications: items, unreadCount: items.filter(item => !item.read).length, markRead, markAllRead }
}
