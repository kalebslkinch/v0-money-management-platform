/**
 * BackgroundEventEngine
 * ---------------------
 * Browser-only singleton that fires one random platform event every 60 seconds.
 * Events are written directly to the localStorage store (same keys as use-store.ts)
 * and the `pmfs:store-change` custom event is dispatched so live React components
 * re-render without polling.
 *
 * Event mix (weighted):
 *   Manager  — new complaint, new task, critical/regulatory alert           (~50%)
 *   Manager + FA — new consultation request (notifies both)                 (~25%)
 *   FA       — client-activity notification directed at a specific advisor  (~25%)
 *
 * Designed to never throw; all tick errors are caught and logged as warnings.
 */

import { mockAdvisors } from '@/lib/data/mock-advisors'
import { mockClients } from '@/lib/data/mock-clients'

// ─── Mirror the storage keys and change-event name from use-store.ts ──────────

const KEYS = {
  notifications: 'pmfs_notifications',
  complaints:    'pmfs_complaints',
  requests:      'pmfs_consultation_requests',
  tasks:         'pmfs_task_records',
} as const

const CHANGE_EVENT = 'pmfs:store-change'

// ─── Types (inline — avoids a circular dep on lib/types/store.ts) ─────────────

type NotificationKind     = 'complaint' | 'request' | 'critical' | 'info'
type NotificationAudience = 'manager' | 'fa' | 'customer' | 'all'

interface StoredNotification {
  id: string
  kind: NotificationKind
  audience: NotificationAudience
  audienceUserId?: string
  title: string
  message: string
  href?: string
  read: boolean
  createdAt: string
}

type ComplaintCategory = 'service' | 'billing' | 'technical' | 'advisor' | 'other'
type ComplaintStatus   = 'submitted'

interface StoredComplaint {
  id: string
  clientId: string
  clientName: string
  category: ComplaintCategory
  subject: string
  description: string
  status: ComplaintStatus
  referenceNumber: string
  createdAt: string
  updatedAt: string
}

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
type TaskStatus   = 'open'

interface StoredTask {
  id: string
  title: string
  description?: string
  assigneeId?: string
  assigneeName?: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string
  createdById: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

interface StoredConsultationRequest {
  id: string
  clientId: string
  clientName: string
  topic: string
  message: string
  status: 'open'
  assignedAdvisorId?: string
  assignedAdvisorName?: string
  createdAt: string
  updatedAt: string
  responses: never[]
}

// ─── Low-level store helpers ───────────────────────────────────────────────────

function readStore<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

function writeStore<T>(key: string, value: T[]): void {
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }))
}

// ─── Small utilities ───────────────────────────────────────────────────────────

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function ts(): string {
  return new Date().toISOString()
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pushNotif(input: Omit<StoredNotification, 'id' | 'createdAt' | 'read'>): void {
  const notification: StoredNotification = {
    ...input,
    id: uid('NTF'),
    createdAt: ts(),
    read: false,
  }
  const current = readStore<StoredNotification>(KEYS.notifications)
  writeStore(KEYS.notifications, [notification, ...current])
}

function cmpRefNumber(): string {
  const d = new Date()
  const yymm = `${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `CMP-${yymm}-${rand}`
}

// ─── Active-user pools (computed once, never mutate mock arrays) ───────────────

const ACTIVE_CLIENTS  = mockClients.filter(c => c.status === 'active')
const ACTIVE_ADVISORS = mockAdvisors.filter(a => a.status === 'active')

// ─── Event: new customer complaint ────────────────────────────────────────────

const COMPLAINT_TEMPLATES: ReadonlyArray<{
  subject: string
  description: string
  category: ComplaintCategory
}> = [
  {
    subject: 'Incorrect fee charged on my account',
    description: 'I noticed a charge that I did not authorise. Please investigate as soon as possible.',
    category: 'billing',
  },
  {
    subject: 'Advisor not responding to my messages',
    description: 'I have sent three messages in the past week and received no reply from my assigned advisor.',
    category: 'advisor',
  },
  {
    subject: 'Transaction missing from statement',
    description: 'My last bank transfer does not appear on my statement despite clearing my bank.',
    category: 'billing',
  },
  {
    subject: 'Budget categories not updating correctly',
    description: 'The budget tracker has not updated since last Tuesday. All categories show stale data.',
    category: 'technical',
  },
  {
    subject: 'Unable to access my portfolio report',
    description: 'When I try to download my quarterly portfolio report I receive an error page.',
    category: 'technical',
  },
  {
    subject: 'Monthly statement not received',
    description: 'I should have received my March statement by now but nothing has arrived.',
    category: 'service',
  },
  {
    subject: 'Unauthorised direct debit on account',
    description: 'A direct debit I did not set up appeared on my account. I need this reversed.',
    category: 'billing',
  },
  {
    subject: 'Risk profile change not applied',
    description: 'My risk profile still shows "high" even though I requested a change to "moderate" last month.',
    category: 'service',
  },
]

function genComplaint(): void {
  if (ACTIVE_CLIENTS.length === 0) return
  const client   = pick(ACTIVE_CLIENTS)
  const template = pick(COMPLAINT_TEMPLATES)

  const complaint: StoredComplaint = {
    id:              uid('CMP'),
    clientId:        client.id,
    clientName:      client.name,
    category:        template.category,
    subject:         template.subject,
    description:     template.description,
    status:          'submitted',
    referenceNumber: cmpRefNumber(),
    createdAt:       ts(),
    updatedAt:       ts(),
  }

  const current = readStore<StoredComplaint>(KEYS.complaints)
  writeStore(KEYS.complaints, [complaint, ...current])

  pushNotif({
    kind:     'complaint',
    audience: 'manager',
    title:    'New customer complaint',
    message:  `${client.name} submitted a complaint: "${template.subject}".`,
    href:     '/admin/complaints',
  })
}

// ─── Event: new consultation request ──────────────────────────────────────────

const CONSULTATION_TOPICS: ReadonlyArray<{ topic: string; message: string }> = [
  {
    topic:   'Help reviewing my monthly budget',
    message: 'Could we go through my spending and set realistic limits for next month?',
  },
  {
    topic:   'Understanding my portfolio allocation',
    message: 'I am not sure why my allocation changed. Can we walk through it together?',
  },
  {
    topic:   'Setting up an emergency savings goal',
    message: 'I would like to start building a 3-month emergency fund. Where do I start?',
  },
  {
    topic:   'Reviewing my pension contributions',
    message: 'Am I contributing enough for my target retirement age? Please advise.',
  },
  {
    topic:   'Advice on reducing monthly outgoings',
    message: 'My expenses have increased. Can you help me identify areas to cut back?',
  },
  {
    topic:   'Tax year-end planning',
    message: 'I want to make the most of my ISA allowance before April. Can we chat?',
  },
  {
    topic:   'Switching to a lower-risk portfolio',
    message: 'With market volatility I would prefer a more conservative approach.',
  },
  {
    topic:   'Querying a recent account transaction',
    message: 'There is a transaction I do not recognise. I would like to discuss it.',
  },
  {
    topic:   'Setting up automatic savings transfers',
    message: 'Can you help me set up standing orders for my savings goals?',
  },
  {
    topic:   'Reviewing insurance coverage options',
    message: 'I think I might be under-insured. Can we review my current coverage?',
  },
]

function genConsultationRequest(): void {
  if (ACTIVE_CLIENTS.length === 0 || ACTIVE_ADVISORS.length === 0) return
  const client   = pick(ACTIVE_CLIENTS)
  const advisor  = mockAdvisors.find(a => a.id === client.advisorId && a.status === 'active')
                ?? pick(ACTIVE_ADVISORS)
  const template = pick(CONSULTATION_TOPICS)

  const request: StoredConsultationRequest = {
    id:                  uid('REQ'),
    clientId:            client.id,
    clientName:          client.name,
    topic:               template.topic,
    message:             template.message,
    status:              'open',
    assignedAdvisorId:   advisor.id,
    assignedAdvisorName: advisor.name,
    createdAt:           ts(),
    updatedAt:           ts(),
    responses:           [],
  }

  const current = readStore<StoredConsultationRequest>(KEYS.requests)
  writeStore(KEYS.requests, [request, ...current])

  // Notify manager
  pushNotif({
    kind:     'request',
    audience: 'manager',
    title:    'New consultation request',
    message:  `${client.name} requested help on "${template.topic}".`,
    href:     '/admin/requests',
  })

  // Notify the assigned FA
  pushNotif({
    kind:           'request',
    audience:       'fa',
    audienceUserId: advisor.id,
    title:          'New consultation request assigned',
    message:        `${client.name} needs help with "${template.topic}".`,
    href:           '/admin/requests',
  })
}

// ─── Event: new system task ────────────────────────────────────────────────────

const TASK_TEMPLATES: ReadonlyArray<{
  title: string
  description: string
  priority: TaskPriority
}> = [
  {
    title:       'Review client onboarding documents',
    description: 'Verify KYC documents and flag any missing items for the compliance team.',
    priority:    'high',
  },
  {
    title:       'Send Q2 portfolio performance summary',
    description: 'Compile and send the quarterly performance summary to assigned clients.',
    priority:    'medium',
  },
  {
    title:       'Schedule client annual review calls',
    description: 'Reach out to all active clients and schedule their annual portfolio review.',
    priority:    'medium',
  },
  {
    title:       'Compliance checklist sign-off',
    description: 'Complete and submit the monthly compliance checklist before end of day.',
    priority:    'urgent',
  },
  {
    title:       'Update risk profiles for flagged accounts',
    description: 'Review accounts flagged by the risk engine and update profiles as required.',
    priority:    'high',
  },
  {
    title:       'Prepare client investment report',
    description: 'Draft the monthly investment performance report for selected client accounts.',
    priority:    'medium',
  },
  {
    title:       'AML screening for new accounts',
    description: 'Run anti-money-laundering checks on all new client accounts opened this week.',
    priority:    'urgent',
  },
  {
    title:       'Follow up on pending consultation requests',
    description: 'Contact clients whose consultation requests have been open for more than 5 days.',
    priority:    'low',
  },
]

function genTask(): void {
  const template  = pick(TASK_TEMPLATES)
  const assignee  = Math.random() > 0.3 ? pick(ACTIVE_ADVISORS) : null
  const daysOut   = Math.floor(Math.random() * 7) + 1
  const dueDate   = new Date(Date.now() + daysOut * 86_400_000).toISOString().slice(0, 10)

  const task: StoredTask = {
    id:            uid('TASK'),
    title:         template.title,
    description:   template.description,
    assigneeId:    assignee?.id,
    assigneeName:  assignee?.name,
    priority:      template.priority,
    status:        'open',
    dueDate,
    createdById:   'MGR001',
    createdByName: 'Alex Manager',
    createdAt:     ts(),
    updatedAt:     ts(),
  }

  const current = readStore<StoredTask>(KEYS.tasks)
  writeStore(KEYS.tasks, [task, ...current])

  pushNotif({
    kind:     'info',
    audience: 'manager',
    title:    'New task added',
    message:  `"${template.title}" has been queued. Due: ${dueDate}.`,
    href:     '/admin/tasks',
  })

  if (assignee) {
    pushNotif({
      kind:           'info',
      audience:       'fa',
      audienceUserId: assignee.id,
      title:          'New task assigned to you',
      message:        `"${template.title}" is now in your queue. Due: ${dueDate}.`,
      href:           '/admin/tasks',
    })
  }
}

// ─── Event: manager critical / regulatory alert ────────────────────────────────

const CRITICAL_TEMPLATES: ReadonlyArray<{ title: string; message: string }> = [
  {
    title:   'Portfolio risk threshold breached',
    message: 'A client portfolio has exceeded its permitted risk exposure. Immediate review required.',
  },
  {
    title:   'Unusual transaction activity flagged',
    message: 'The risk engine has flagged unusual transaction patterns on a monitored account.',
  },
  {
    title:   'AML alert raised',
    message: 'An automated AML check has returned a positive match. Compliance review required.',
  },
  {
    title:   'Regulatory deadline approaching',
    message: 'A mandatory regulatory submission is due in 3 days. Ensure all documents are filed.',
  },
  {
    title:   'Client data-consent expired',
    message: "A client's data-sharing consent has lapsed and requires renewal before next review.",
  },
  {
    title:   'Adviser caseload at capacity',
    message: 'An adviser currently has more than 10 open cases. Consider redistributing workload.',
  },
]

function genManagerAlert(): void {
  const template = pick(CRITICAL_TEMPLATES)
  pushNotif({
    kind:     'critical',
    audience: 'manager',
    title:    template.title,
    message:  template.message,
    href:     '/admin/performance',
  })
}

// ─── Event: FA client-activity notification ────────────────────────────────────

type MessageFactory = (clientName: string) => string

const FA_UPDATE_MESSAGES: ReadonlyArray<MessageFactory> = [
  (n) => `${n} has updated their data-sharing consent preferences.`,
  (n) => `${n}'s budget utilisation has reached 90% this month.`,
  (n) => `${n} logged 3 new transactions this week — a review is recommended.`,
  (n) => `${n} has not logged any activity in the past 14 days.`,
  (n) => `${n}'s emergency fund goal is now 75% complete.`,
  (n) => `${n} set a new savings goal and is requesting your input.`,
  (n) => `${n} uploaded a new document to their profile for review.`,
]

function genFAClientAlert(): void {
  if (ACTIVE_ADVISORS.length === 0) return
  const advisor        = pick(ACTIVE_ADVISORS)
  const advisorClients = ACTIVE_CLIENTS.filter(c => c.advisorId === advisor.id)
  if (advisorClients.length === 0) return

  const client  = pick(advisorClients)
  const msgFn   = pick(FA_UPDATE_MESSAGES)

  pushNotif({
    kind:           'info',
    audience:       'fa',
    audienceUserId: advisor.id,
    title:          'Client activity update',
    message:        msgFn(client.name),
    href:           '/admin/clients',
  })
}

// ─── Weighted event pool ───────────────────────────────────────────────────────
// Total weight = 100. Adjust values to change the frequency mix.

const EVENT_POOL: ReadonlyArray<{ weight: number; fn: () => void }> = [
  { weight: 20, fn: genComplaint },           // manager – new complaint
  { weight: 25, fn: genConsultationRequest }, // manager + FA – new consultation request
  { weight: 15, fn: genTask },                // manager (+ optional FA) – new task
  { weight: 15, fn: genManagerAlert },        // manager – critical/regulatory alert
  { weight: 25, fn: genFAClientAlert },       // FA – client activity update
]

function pickWeighted(): () => void {
  const total = EVENT_POOL.reduce((sum, e) => sum + e.weight, 0)
  let r = Math.random() * total
  for (const entry of EVENT_POOL) {
    r -= entry.weight
    if (r <= 0) return entry.fn
  }
  return EVENT_POOL[EVENT_POOL.length - 1].fn
}

// ─── Engine class ─────────────────────────────────────────────────────────────

export class BackgroundEventEngine {
  private intervalId: ReturnType<typeof setInterval> | null = null
  private readonly intervalMs: number

  /** @param intervalMs  Tick interval in ms. Defaults to 60 000 (1 min). */
  constructor(intervalMs = 60_000) {
    this.intervalMs = intervalMs
  }

  /** Start the engine. Idempotent — calling start() when already running is a no-op. */
  start(): void {
    if (typeof window === 'undefined') return // SSR guard
    if (this.intervalId !== null) return       // already running

    this.intervalId = setInterval(() => {
      try {
        pickWeighted()()
      } catch (err) {
        // Never let a tick crash the application.
        console.warn('[BackgroundEventEngine] tick error:', err)
      }
    }, this.intervalMs)
  }

  /** Stop the engine and clear the interval. Safe to call when not running. */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  get running(): boolean {
    return this.intervalId !== null
  }
}

/**
 * Module-level singleton.  Import this in the React mount component; do not
 * instantiate BackgroundEventEngine elsewhere to avoid duplicate intervals.
 */
export const backgroundEventEngine = new BackgroundEventEngine()
