'use client'

/**
 * Spending alerts runner – mounts the use-spending-alerts engine into the
 * admin shell so SRD-U09 notifications fire across the app.
 */

import { useSpendingAlerts } from '@/hooks/use-spending-alerts'

export function SpendingAlertsRunner() {
  useSpendingAlerts()
  return null
}
