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
  ClientNote,
  Complaint,
  ConsultationRecord,
  ConsultationRequest,
  ConsultationResponse,
  DataSharingConsent,
  DirectMessage,
  MessageThread,
  OnboardingState,
  PerformanceNote,
  ReportTemplate,
  TaskRecord,
  TeamMember,
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
  teamMembers: 'pmfs_team_members',
  tasks: 'pmfs_task_records',
  complaints: 'pmfs_complaints',
  performanceNotes: 'pmfs_performance_notes',
  clientNotes: 'pmfs_client_notes',
  reportTemplates: 'pmfs_report_templates',
  messageThreads: 'pmfs_message_threads',
  directMessages: 'pmfs_direct_messages',
  onboarding: 'pmfs_onboarding_state',
  spendingAlerts: 'pmfs_spending_alerts_sent',
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

// ─── Team members (manager-managed staff records) ─────────────────────────────

export function useTeamMembers() {
  const [all, setAll] = useStorageList<TeamMember>(STORAGE_KEYS.teamMembers)

  const create = useCallback(
    (input: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      const next: TeamMember = { ...input, id: generateId('TM'), createdAt: now, updatedAt: now }
      setAll([next, ...readArray<TeamMember>(STORAGE_KEYS.teamMembers)])
      return next
    },
    [setAll],
  )

  const update = useCallback(
    (id: string, patch: Partial<Omit<TeamMember, 'id' | 'createdAt'>>) => {
      const current = readArray<TeamMember>(STORAGE_KEYS.teamMembers)
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
      const current = readArray<TeamMember>(STORAGE_KEYS.teamMembers)
      setAll(current.filter(item => item.id !== id))
    },
    [setAll],
  )

  return { teamMembers: all, create, update, remove }
}

// ─── Task records (manager-managed tasks) ─────────────────────────────────────

export function useTasks() {
  const [all, setAll] = useStorageList<TaskRecord>(STORAGE_KEYS.tasks)

  const create = useCallback(
    (input: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      const next: TaskRecord = { ...input, id: generateId('TASK'), createdAt: now, updatedAt: now }
      setAll([next, ...readArray<TaskRecord>(STORAGE_KEYS.tasks)])
      return next
    },
    [setAll],
  )

  const update = useCallback(
    (id: string, patch: Partial<Omit<TaskRecord, 'id' | 'createdAt'>>) => {
      const current = readArray<TaskRecord>(STORAGE_KEYS.tasks)
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
      const current = readArray<TaskRecord>(STORAGE_KEYS.tasks)
      setAll(current.filter(item => item.id !== id))
    },
    [setAll],
  )

  return { tasks: all, create, update, remove }
}

// ─── Performance notes (SRD-M12) ──────────────────────────────────────────────

export function usePerformanceNotes(memberId?: string) {
  const [all, setAll] = useStorageList<PerformanceNote>(STORAGE_KEYS.performanceNotes)
  const items = memberId ? all.filter(item => item.memberId === memberId) : all

  const create = useCallback(
    (input: Omit<PerformanceNote, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      const next: PerformanceNote = { ...input, id: generateId('PNOTE'), createdAt: now, updatedAt: now }
      setAll([next, ...readArray<PerformanceNote>(STORAGE_KEYS.performanceNotes)])
      return next
    },
    [setAll],
  )

  const update = useCallback(
    (id: string, patch: Partial<Pick<PerformanceNote, 'content' | 'category'>>) => {
      const current = readArray<PerformanceNote>(STORAGE_KEYS.performanceNotes)
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
      const current = readArray<PerformanceNote>(STORAGE_KEYS.performanceNotes)
      setAll(current.filter(item => item.id !== id))
    },
    [setAll],
  )

  return { notes: items, create, update, remove }
}

// ─── Customer complaints (SRD-U09) ────────────────────────────────────────────

function generateReferenceNumber(): string {
  const prefix = 'CMP'
  const date = new Date()
  const yymm = `${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}-${yymm}-${rand}`
}

export function useComplaints(clientId?: string) {
  const [all, setAll] = useStorageList<Complaint>(STORAGE_KEYS.complaints)
  const items = clientId ? all.filter(item => item.clientId === clientId) : all

  const create = useCallback(
    (input: Omit<Complaint, 'id' | 'status' | 'referenceNumber' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      const next: Complaint = {
        ...input,
        id: generateId('CMP'),
        status: 'submitted',
        referenceNumber: generateReferenceNumber(),
        createdAt: now,
        updatedAt: now,
      }
      setAll([next, ...readArray<Complaint>(STORAGE_KEYS.complaints)])
      pushNotification({
        kind: 'complaint',
        audience: 'manager',
        title: 'New customer complaint',
        message: `${input.clientName} submitted a complaint: "${input.subject}".`,
        href: '/admin/complaints',
      })
      return next
    },
    [setAll],
  )

  return { complaints: items, create }
}

// ─── Adviser internal client notes (SRD-A07) ──────────────────────────────────

export function useClientNotes(clientId?: string) {
  const [all, setAll] = useStorageList<ClientNote>(STORAGE_KEYS.clientNotes)
  const items = clientId ? all.filter(item => item.clientId === clientId) : all

  const create = useCallback(
    (input: Omit<ClientNote, 'id' | 'createdAt' | 'updatedAt' | 'pinned'> & { pinned?: boolean }) => {
      const now = new Date().toISOString()
      const next: ClientNote = {
        ...input,
        pinned: input.pinned ?? false,
        id: generateId('CNOTE'),
        createdAt: now,
        updatedAt: now,
      }
      setAll([next, ...readArray<ClientNote>(STORAGE_KEYS.clientNotes)])
      return next
    },
    [setAll],
  )

  const update = useCallback(
    (id: string, patch: Partial<Pick<ClientNote, 'content' | 'tags' | 'pinned'>>) => {
      const current = readArray<ClientNote>(STORAGE_KEYS.clientNotes)
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
      const current = readArray<ClientNote>(STORAGE_KEYS.clientNotes)
      setAll(current.filter(item => item.id !== id))
    },
    [setAll],
  )

  return { notes: items, create, update, remove }
}

// ─── Saved report templates (SRD-G09, SRD-U14) ────────────────────────────────

export function useReportTemplates(scope?: ReportTemplate['scope']) {
  const [all, setAll] = useStorageList<ReportTemplate>(STORAGE_KEYS.reportTemplates)
  const items = scope ? all.filter(item => item.scope === scope || item.scope === 'shared') : all

  const create = useCallback(
    (input: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt' | 'builtIn'>) => {
      const now = new Date().toISOString()
      const next: ReportTemplate = {
        ...input,
        builtIn: false,
        id: generateId('RTPL'),
        createdAt: now,
        updatedAt: now,
      }
      setAll([next, ...readArray<ReportTemplate>(STORAGE_KEYS.reportTemplates)])
      return next
    },
    [setAll],
  )

  const update = useCallback(
    (id: string, patch: Partial<Pick<ReportTemplate, 'name' | 'description' | 'config'>>) => {
      const current = readArray<ReportTemplate>(STORAGE_KEYS.reportTemplates)
      setAll(
        current.map(item =>
          item.id === id && !item.builtIn
            ? { ...item, ...patch, updatedAt: new Date().toISOString() }
            : item,
        ),
      )
    },
    [setAll],
  )

  const remove = useCallback(
    (id: string) => {
      const current = readArray<ReportTemplate>(STORAGE_KEYS.reportTemplates)
      setAll(current.filter(item => item.id !== id || item.builtIn))
    },
    [setAll],
  )

  return { templates: items, create, update, remove }
}

// ─── Direct messaging (SRD-M18) ───────────────────────────────────────────────

export function useMessageThreads(userId?: string) {
  const [all, setAll] = useStorageList<MessageThread>(STORAGE_KEYS.messageThreads)
  const items = userId
    ? all.filter(item => item.participantIds.includes(userId))
    : all

  const sorted = [...items].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  )

  const create = useCallback(
    (input: Omit<MessageThread, 'id' | 'createdAt' | 'updatedAt' | 'lastMessageAt'>) => {
      const now = new Date().toISOString()
      const next: MessageThread = {
        ...input,
        id: generateId('THRD'),
        createdAt: now,
        updatedAt: now,
        lastMessageAt: now,
      }
      setAll([next, ...readArray<MessageThread>(STORAGE_KEYS.messageThreads)])
      return next
    },
    [setAll],
  )

  const touch = useCallback(
    (id: string) => {
      const current = readArray<MessageThread>(STORAGE_KEYS.messageThreads)
      const now = new Date().toISOString()
      setAll(
        current.map(item =>
          item.id === id ? { ...item, lastMessageAt: now, updatedAt: now } : item,
        ),
      )
    },
    [setAll],
  )

  return { threads: sorted, create, touch }
}

export function useDirectMessages(threadId?: string) {
  const [all, setAll] = useStorageList<DirectMessage>(STORAGE_KEYS.directMessages)
  const items = threadId ? all.filter(item => item.threadId === threadId) : all
  const ordered = [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  const send = useCallback(
    (input: Omit<DirectMessage, 'id' | 'createdAt' | 'readBy'> & { readBy?: string[] }) => {
      const now = new Date().toISOString()
      const next: DirectMessage = {
        ...input,
        readBy: input.readBy ?? [input.authorId],
        id: generateId('MSG'),
        createdAt: now,
      }
      setAll([next, ...readArray<DirectMessage>(STORAGE_KEYS.directMessages)])

      // Mirror to thread.lastMessageAt
      const threads = readArray<MessageThread>(STORAGE_KEYS.messageThreads)
      const updatedThreads = threads.map(thread =>
        thread.id === input.threadId
          ? { ...thread, lastMessageAt: now, updatedAt: now }
          : thread,
      )
      writeArray(STORAGE_KEYS.messageThreads, updatedThreads)

      // Notify the *other* participants in the thread
      const thread = updatedThreads.find(t => t.id === input.threadId)
      if (thread) {
        for (let i = 0; i < thread.participantIds.length; i++) {
          const pid = thread.participantIds[i]
          if (pid === input.authorId) continue
          pushNotification({
            kind: 'info',
            audience: thread.kind === 'manager_advisor' && pid !== input.authorId ? 'all' : 'all',
            audienceUserId: pid,
            title: `New message from ${input.authorName}`,
            message: input.body.length > 80 ? `${input.body.slice(0, 77)}…` : input.body,
            href: '/admin/messages',
          })
        }
      }

      return next
    },
    [setAll],
  )

  const markRead = useCallback(
    (messageId: string, userId: string) => {
      const current = readArray<DirectMessage>(STORAGE_KEYS.directMessages)
      setAll(
        current.map(item => {
          if (item.id !== messageId) return item
          if (item.readBy.includes(userId)) return item
          return { ...item, readBy: [...item.readBy, userId] }
        }),
      )
    },
    [setAll],
  )

  return { messages: ordered, send, markRead }
}

// ─── Onboarding (SRD-G11) ─────────────────────────────────────────────────────

export function useOnboarding(userId: string, role: OnboardingState['role']) {
  const [all, setAll] = useStorageList<OnboardingState>(STORAGE_KEYS.onboarding)
  const state: OnboardingState =
    all.find(item => item.userId === userId) ?? {
      userId,
      role,
      completed: false,
    }

  const complete = useCallback(() => {
    const current = readArray<OnboardingState>(STORAGE_KEYS.onboarding)
    const now = new Date().toISOString()
    const next: OnboardingState = {
      userId,
      role,
      completed: true,
      completedAt: now,
    }
    setAll([next, ...current.filter(item => item.userId !== userId)])
  }, [setAll, userId, role])

  const dismiss = useCallback(() => {
    const current = readArray<OnboardingState>(STORAGE_KEYS.onboarding)
    const now = new Date().toISOString()
    const next: OnboardingState = {
      userId,
      role,
      completed: true,
      dismissedAt: now,
    }
    setAll([next, ...current.filter(item => item.userId !== userId)])
  }, [setAll, userId, role])

  const reset = useCallback(() => {
    const current = readArray<OnboardingState>(STORAGE_KEYS.onboarding)
    setAll(current.filter(item => item.userId !== userId))
  }, [setAll, userId])

  return { state, complete, dismiss, reset }
}

// ─── Spending alert deduplication (SRD-U09) ───────────────────────────────────

/**
 * Track which (clientId + categoryId + YYYY-WW) tuples have already fired a
 * spending-limit notification so we don't spam the user every render.
 */
function readAlertKeys(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.spendingAlerts)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function writeAlertKeys(keys: Set<string>): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEYS.spendingAlerts, JSON.stringify([...keys]))
}

export function hasSpendingAlertBeenSent(key: string): boolean {
  return readAlertKeys().has(key)
}

export function markSpendingAlertSent(key: string): void {
  const keys = readAlertKeys()
  keys.add(key)
  writeAlertKeys(keys)
}
