/**
 * Spending-limit notification engine (SRD-U09).
 *
 * For each customer, watches their recorded transactions against their
 * weekly category budgets (from the PFMS snapshot) and pushes an
 * AppNotification whenever a category reaches one of three thresholds:
 *
 *   • 80 %  → kind: 'info'      ("Heads up: nearing limit")
 *   • 100 % → kind: 'critical'  ("Spending limit reached")
 *   • 120 % → kind: 'critical'  ("Limit exceeded by 20%+")
 *
 * Deduplication: each (clientId + categoryId + threshold + ISO-week)
 * combination is only sent once; once the calendar week rolls over the
 * alerts can fire again. Keys live in localStorage and are pruned by the
 * existing helpers in use-store.
 *
 * The hook is mounted from the admin shell via <SpendingAlertsRunner/>.
 */

'use client'

import { useEffect } from 'react'
import {
  hasSpendingAlertBeenSent,
  markSpendingAlertSent,
  pushNotification,
} from '@/hooks/use-store'
import type { UserTransaction } from '@/lib/types/store'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'

const TXN_KEY = 'pmfs_user_transactions'
const CHECK_INTERVAL_MS = 60_000

const THRESHOLDS: { pct: number; label: string; kind: 'info' | 'critical' }[] = [
  { pct: 0.8,  label: 'nearing your limit (80%)',        kind: 'info' },
  { pct: 1.0,  label: 'spending limit reached',          kind: 'critical' },
  { pct: 1.2,  label: 'limit exceeded by 20% or more',   kind: 'critical' },
]

function readTransactions(): UserTransaction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(TXN_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as UserTransaction[]) : []
  } catch {
    return []
  }
}

/** ISO week-year string, e.g. "2024-W07". */
function isoWeekKey(date: Date): string {
  // Copy date so we don't mutate it.
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  // Move to nearest Thursday: current date + 4 - current day number.
  const dayNum = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function isThisWeek(iso: string, weekKey: string): boolean {
  return isoWeekKey(new Date(iso)) === weekKey
}

function checkSpendingAlerts(): void {
  const transactions = readTransactions()
  if (transactions.length === 0) return

  const weekKey = isoWeekKey(new Date())

  // Bucket spending by clientId + categoryId for the current ISO week.
  const totals = new Map<string, Map<string, number>>()
  for (const txn of transactions) {
    if (!isThisWeek(txn.date, weekKey)) continue
    let perClient = totals.get(txn.clientId)
    if (!perClient) {
      perClient = new Map()
      totals.set(txn.clientId, perClient)
    }
    perClient.set(txn.categoryId, (perClient.get(txn.categoryId) ?? 0) + txn.amount)
  }

  for (const [clientId, perCategory] of totals) {
    const snapshot = getPFMSSnapshotForCustomer(clientId)
    for (const category of snapshot.categories) {
      const spent = perCategory.get(category.id) ?? 0
      if (category.weeklyBudget <= 0) continue
      const ratio = spent / category.weeklyBudget

      for (const threshold of THRESHOLDS) {
        if (ratio < threshold.pct) continue
        const key = `${clientId}:${category.id}:${threshold.pct}:${weekKey}`
        if (hasSpendingAlertBeenSent(key)) continue

        pushNotification({
          kind: threshold.kind,
          audience: 'customer',
          audienceUserId: clientId,
          title: `${category.label} – ${threshold.label}`,
          message: `You have spent GBP ${spent.toFixed(2)} of your GBP ${category.weeklyBudget.toFixed(2)} weekly ${category.label} budget.`,
          href: '/admin/transactions',
        })
        markSpendingAlertSent(key)
      }
    }
  }
}

/**
 * Mount this hook once in the admin shell. It evaluates spending against
 * weekly budgets immediately and then every CHECK_INTERVAL_MS.
 */
export function useSpendingAlerts(): void {
  useEffect(() => {
    const init = setTimeout(checkSpendingAlerts, 3_000)
    const interval = setInterval(checkSpendingAlerts, CHECK_INTERVAL_MS)
    return () => {
      clearTimeout(init)
      clearInterval(interval)
    }
  }, [])
}
