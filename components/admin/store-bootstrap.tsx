/**
 * One-time bootstrap that seeds the local store with demo notifications
 * and consultation data so the manager dashboard, FA inbox, and
 * notification bell all have visible content without manual setup.
 *
 * Runs only in the browser, only once per browser profile.
 */

'use client'

import { useEffect } from 'react'
import { BUILT_IN_REPORT_TEMPLATES } from '@/lib/data/report-templates'

const SEED_FLAG_KEY = 'pmfs_seed_v1_done'
const SEED_TASKS_FLAG_KEY = 'pmfs_seed_v2_tasks_done'

interface SeedNotification {
  id: string
  kind: 'complaint' | 'request' | 'critical' | 'info'
  audience: 'manager' | 'fa' | 'customer' | 'all'
  audienceUserId?: string
  title: string
  message: string
  href?: string
  read: boolean
  createdAt: string
}

interface SeedConsultationRequest {
  id: string
  clientId: string
  clientName: string
  topic: string
  message: string
  status: 'open' | 'assigned' | 'responded' | 'closed'
  assignedAdvisorId?: string
  assignedAdvisorName?: string
  createdAt: string
  updatedAt: string
  responses: never[]
}

type SeedTaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
type SeedTaskPriority = 'low' | 'medium' | 'high' | 'urgent'

interface SeedTask {
  id: string
  title: string
  description?: string
  assigneeId?: string
  assigneeName?: string
  priority: SeedTaskPriority
  status: SeedTaskStatus
  dueDate?: string
  createdById: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export function StoreBootstrap() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(SEED_FLAG_KEY) === 'true') return

    const now = Date.now()
    const minutes = (n: number) => new Date(now - n * 60_000).toISOString()
    const hours = (n: number) => new Date(now - n * 3_600_000).toISOString()

    const seedNotifications: SeedNotification[] = [
      {
        id: 'NTF-seed-1',
        kind: 'complaint',
        audience: 'manager',
        title: 'Customer complaint logged',
        message: 'Sarah Mitchell raised an issue about a missing transaction.',
        href: '/admin/requests',
        read: false,
        createdAt: minutes(12),
      },
      {
        id: 'NTF-seed-2',
        kind: 'request',
        audience: 'manager',
        title: 'New adviser request',
        message: 'James Wilson requested reassignment for client CLT004.',
        href: '/admin/requests',
        read: false,
        createdAt: hours(2),
      },
      {
        id: 'NTF-seed-3',
        kind: 'critical',
        audience: 'manager',
        title: 'Critical event',
        message: 'Spending in Food category trended 35% over budget last week.',
        href: '/admin/performance',
        read: false,
        createdAt: hours(5),
      },
      {
        id: 'NTF-seed-4',
        kind: 'request',
        audience: 'fa',
        audienceUserId: 'ADV001',
        title: 'New consultation request',
        message: 'Sarah Mitchell asked about her weekly grocery budget.',
        href: '/admin/requests',
        read: false,
        createdAt: minutes(35),
      },
      {
        id: 'NTF-seed-5',
        kind: 'info',
        audience: 'customer',
        title: 'Welcome to PMFS',
        message: 'Tap the help icon at the top right anytime for guides and support.',
        href: '/admin/privacy',
        read: false,
        createdAt: hours(24),
      },
    ]

    const seedRequests: SeedConsultationRequest[] = [
      {
        id: 'REQ-seed-1',
        clientId: 'CLT001',
        clientName: 'Sarah Mitchell',
        topic: 'Help reviewing my weekly grocery budget',
        message:
          'I keep going over my Tesco budget. Can we go through what I should change before next month?',
        status: 'open',
        assignedAdvisorId: 'ADV001',
        assignedAdvisorName: 'James Wilson',
        createdAt: hours(3),
        updatedAt: hours(3),
        responses: [],
      },
      {
        id: 'REQ-seed-2',
        clientId: 'CLT002',
        clientName: 'Michael Chen',
        topic: 'Setting up a holiday savings goal',
        message: 'I would like to put aside £150/month for a trip later this year.',
        status: 'open',
        createdAt: hours(28),
        updatedAt: hours(28),
        responses: [],
      },
    ]

    const existingNotifications = readSafe('pmfs_notifications')
    const existingRequests = readSafe('pmfs_consultation_requests')

    if (existingNotifications.length === 0) {
      window.localStorage.setItem('pmfs_notifications', JSON.stringify(seedNotifications))
    }
    if (existingRequests.length === 0) {
      window.localStorage.setItem('pmfs_consultation_requests', JSON.stringify(seedRequests))
    }

    window.localStorage.setItem(SEED_FLAG_KEY, 'true')
    window.dispatchEvent(new CustomEvent('pmfs:store-change'))
  }, [])

  // ── Task seed (v2) – runs independently so existing users also get demo data ──
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(SEED_TASKS_FLAG_KEY) === 'true') return

    const now = Date.now()
    const days = (n: number) => new Date(now + n * 86_400_000).toISOString().slice(0, 10)

    const seedTasks: SeedTask[] = [
      {
        id: 'TASK-seed-1',
        title: 'Review Q2 portfolio rebalancing',
        description: 'Assess all client portfolios ahead of the Q2 rebalancing window.',
        assigneeId: 'ADV001',
        assigneeName: 'James Wilson',
        priority: 'urgent',
        status: 'in_progress',
        dueDate: days(-1), // yesterday → overdue
        createdById: 'MGR001',
        createdByName: 'Alex Manager',
        createdAt: new Date(now - 3 * 86_400_000).toISOString(),
        updatedAt: new Date(now - 86_400_000).toISOString(),
      },
      {
        id: 'TASK-seed-2',
        title: 'Send monthly performance reports',
        description: 'Compile and email the monthly performance summary to all clients.',
        assigneeId: 'ADV002',
        assigneeName: 'Emily Carter',
        priority: 'high',
        status: 'open',
        dueDate: days(0), // today
        createdById: 'MGR001',
        createdByName: 'Alex Manager',
        createdAt: new Date(now - 2 * 86_400_000).toISOString(),
        updatedAt: new Date(now - 2 * 86_400_000).toISOString(),
      },
      {
        id: 'TASK-seed-3',
        title: 'Compliance audit preparation',
        description: 'Gather documentation required for the upcoming regulatory compliance audit.',
        priority: 'high',
        status: 'open',
        dueDate: days(1), // tomorrow
        createdById: 'MGR001',
        createdByName: 'Alex Manager',
        createdAt: new Date(now - 5 * 86_400_000).toISOString(),
        updatedAt: new Date(now - 5 * 86_400_000).toISOString(),
      },
      {
        id: 'TASK-seed-4',
        title: 'Onboard new junior adviser',
        description: 'Complete system access setup and introductory training for new hire.',
        assigneeId: 'ADV003',
        assigneeName: 'Sophie Turner',
        priority: 'medium',
        status: 'open',
        dueDate: days(5),
        createdById: 'MGR001',
        createdByName: 'Alex Manager',
        createdAt: new Date(now - 86_400_000).toISOString(),
        updatedAt: new Date(now - 86_400_000).toISOString(),
      },
    ]

    const existingTasks = readSafe('pmfs_task_records')
    if (existingTasks.length === 0) {
      window.localStorage.setItem('pmfs_task_records', JSON.stringify(seedTasks))
    }

    window.localStorage.setItem(SEED_TASKS_FLAG_KEY, 'true')
    window.dispatchEvent(new CustomEvent('pmfs:store-change'))
  }, [])

  // ── Report templates seed (v3) – seed built-in standardised report templates ──
  useEffect(() => {
    if (typeof window === 'undefined') return
    const FLAG = 'pmfs_seed_v3_report_templates_done'
    if (window.localStorage.getItem(FLAG) === 'true') return

    const existing = readSafe('pmfs_report_templates')
    // Merge built-ins, deduplicating by id so existing user templates are preserved.
    const existingIds = new Set(existing.map((item: unknown) => (item as { id?: string }).id))
    const merged = [
      ...BUILT_IN_REPORT_TEMPLATES.filter(template => !existingIds.has(template.id)),
      ...(existing as unknown[]),
    ]
    window.localStorage.setItem('pmfs_report_templates', JSON.stringify(merged))
    window.localStorage.setItem(FLAG, 'true')
    window.dispatchEvent(new CustomEvent('pmfs:store-change'))
  }, [])

  return null
}

function readSafe(key: string): unknown[] {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
