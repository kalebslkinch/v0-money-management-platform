/**
 * Null-rendering component that mounts the automatic deadline reminder
 * scheduler (SRD-M13) for the admin shell.
 *
 * Drop this inside AdminLayout alongside <StoreBootstrap /> so it runs
 * for every admin page without cluttering individual page components.
 */

'use client'

import { useReminderScheduler } from '@/hooks/use-reminder-scheduler'

export function ReminderScheduler() {
  useReminderScheduler()
  return null
}
