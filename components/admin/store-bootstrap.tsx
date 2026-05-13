/**
 * One-time bootstrap that seeds the local store with demo notifications
 * and consultation data so the manager dashboard, FA inbox, and
 * notification bell all have visible content without manual setup.
 *
 * Runs only in the browser, only once per browser profile.
 */

'use client'

import { useEffect } from 'react'

const SEED_FLAG_KEY = 'pmfs_seed_v1_done'

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
