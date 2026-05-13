/**
 * Automatic deadline reminder scheduler (SRD-M13).
 *
 * Runs immediately on mount and then every 60 seconds. For each active
 * TaskRecord that has a dueDate it fires an AppNotification via
 * pushNotification() according to urgency:
 *
 *   • Overdue  → kind: 'critical'
 *   • Due today  → kind: 'info'  (with Calendar icon in bell)
 *   • Due tomorrow → kind: 'info'
 *
 * Deduplication: a localStorage key tracks which (taskId + bucket + calendar-date)
 * combos have already been notified so the same reminder is never sent twice on
 * the same day regardless of how many times the scheduler fires.
 */

'use client'

import { useEffect } from 'react'
import { pushNotification } from '@/hooks/use-store'
import type { TaskRecord } from '@/lib/types/store'

// ─── Constants ────────────────────────────────────────────────────────────────

const TASKS_KEY = 'pmfs_task_records'
const SENT_KEY = 'pmfs_reminder_sent_ids'
const CHECK_INTERVAL_MS = 60_000 // 1 minute

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the YYYY-MM-DD portion of an ISO timestamp. */
function toDateOnly(iso: string): string {
  return iso.slice(0, 10)
}

function readTasks(): TaskRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(TASKS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as TaskRecord[]) : []
  } catch {
    return []
  }
}

function readSentIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(SENT_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function writeSentIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SENT_KEY, JSON.stringify([...ids]))
}

/** Prune sent-ID entries older than 7 days to prevent unbounded growth. */
function pruneOldEntries(ids: Set<string>, todayStr: string): Set<string> {
  const cutoff = toDateOnly(new Date(Date.now() - 7 * 86_400_000).toISOString())
  const pruned = new Set<string>()
  for (const id of ids) {
    const parts = id.split(':')
    const dateStr = parts[parts.length - 1]
    if (dateStr >= cutoff) pruned.add(id)
  }
  return pruned
}

// ─── Core check ───────────────────────────────────────────────────────────────

function checkAndSendReminders(): void {
  const tasks = readTasks()
  if (tasks.length === 0) return

  const todayStr = toDateOnly(new Date().toISOString())
  const tomorrowStr = toDateOnly(new Date(Date.now() + 86_400_000).toISOString())

  let sentIds = pruneOldEntries(readSentIds(), todayStr)
  let changed = false

  for (const task of tasks) {
    // Skip inactive tasks
    if (task.status === 'completed' || task.status === 'cancelled') continue
    if (!task.dueDate) continue

    const due = toDateOnly(task.dueDate)
    const assigneeNote = task.assigneeName ? ` Assigned to ${task.assigneeName}.` : ''

    if (due < todayStr) {
      // ── Overdue ──────────────────────────────────────────────────────────
      const key = `${task.id}:overdue:${todayStr}`
      if (!sentIds.has(key)) {
        pushNotification({
          kind: 'critical',
          audience: 'manager',
          title: 'Task overdue',
          message: `"${task.title}" was due on ${due} and is still ${task.status.replace('_', ' ')}.${assigneeNote}`,
          href: '/admin/tasks',
        })
        sentIds.add(key)
        changed = true
      }
    } else if (due === todayStr) {
      // ── Due today ─────────────────────────────────────────────────────────
      const key = `${task.id}:today:${todayStr}`
      if (!sentIds.has(key)) {
        pushNotification({
          kind: 'info',
          audience: 'manager',
          title: 'Task due today',
          message: `"${task.title}" is due today.${assigneeNote}`,
          href: '/admin/tasks',
        })
        sentIds.add(key)
        changed = true
      }
    } else if (due === tomorrowStr) {
      // ── Due tomorrow ──────────────────────────────────────────────────────
      const key = `${task.id}:tomorrow:${todayStr}`
      if (!sentIds.has(key)) {
        pushNotification({
          kind: 'info',
          audience: 'manager',
          title: 'Task due tomorrow',
          message: `"${task.title}" is due tomorrow.${assigneeNote}`,
          href: '/admin/tasks',
        })
        sentIds.add(key)
        changed = true
      }
    }
  }

  if (changed) {
    writeSentIds(sentIds)
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Mount this hook once in the admin shell. It fires on mount (after hydration)
 * and then every CHECK_INTERVAL_MS milliseconds. Returns void.
 */
export function useReminderScheduler(): void {
  useEffect(() => {
    // Slight delay so StoreBootstrap has time to seed data first
    const init = setTimeout(checkAndSendReminders, 2_000)
    const interval = setInterval(checkAndSendReminders, CHECK_INTERVAL_MS)
    return () => {
      clearTimeout(init)
      clearInterval(interval)
    }
  }, [])
}
