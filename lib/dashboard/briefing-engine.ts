import type { BriefingItem, BriefingPriority } from '@/lib/types/dashboard'
import { alerts, kpiData, recentActivities } from '@/lib/data/mock-analytics'
import { mockCases } from '@/lib/data/mock-cases'

// ─── Priority ordering ─────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<BriefingPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  info: 3,
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

// ─── Item Builders ─────────────────────────────────────────────────────────────

/** Map platform alert types to briefing priority levels */
function alertPriority(type: string): BriefingPriority {
  if (type === 'danger') return 'critical'
  if (type === 'warning') return 'high'
  return 'info'
}

/** Build briefing items from compliance / portfolio alerts */
function buildAlertItems(): BriefingItem[] {
  return alerts.map(alert => ({
    id: `alert-${alert.id}`,
    priority: alertPriority(alert.type),
    icon: alert.type === 'danger' ? 'ShieldAlert' : alert.type === 'warning' ? 'AlertTriangle' : 'Info',
    title: alert.title,
    description: alert.message,
    badge: formatDate(alert.timestamp),
    linkedWidgetId: 'alerts-panel' as const,
    actionLabel: 'Review alert',
  }))
}

/** Build briefing items from high-priority open or in-progress cases */
function buildCaseItems(): BriefingItem[] {
  const urgentCases = mockCases
    .filter(c => c.status !== 'resolved' && (c.priority === 'critical' || c.priority === 'high'))
    .slice(0, 3)

  return urgentCases.map(c => ({
    id: `case-${c.id}`,
    priority: c.priority === 'critical' ? 'critical' : 'high',
    icon: c.type === 'compliance' || c.type === 'kyc_update' ? 'FileWarning' : 'ClipboardList',
    title: c.title,
    description: `${c.clientName} — ${c.type.replace('_', ' ')}`,
    badge: `Due ${formatDate(c.dueDate)}`,
    linkedWidgetId: 'activity-feed' as const,
    actionLabel: 'View case',
  }))
}

/** Build a KPI summary item — always informational, always last */
function buildKPISummaryItem(): BriefingItem {
  const onTrackCount = kpiData.clientsOnTrack
  const changeSign = kpiData.onTrackChange >= 0 ? '+' : ''

  return {
    id: 'kpi-summary',
    priority: 'info',
    icon: 'TrendingUp',
    title: 'Budget snapshot',
    description: `${onTrackCount} of ${kpiData.activeClients} active clients are on track. Average budget adherence is ${kpiData.avgBudgetAdherence}%.`,
    badge: `${changeSign}${kpiData.onTrackChange}% this month`,
    linkedWidgetId: 'stats-cards' as const,
    actionLabel: 'Open overview',
  }
}

/** Build a recent activity item when there is notable client activity */
function buildActivityItem(): BriefingItem | null {
  const notable = recentActivities.find(
    a => a.type === 'transaction' || a.type === 'alert',
  )
  if (!notable) return null

  return {
    id: `activity-${notable.id}`,
    priority: notable.type === 'alert' ? 'high' : 'medium',
    icon: notable.type === 'transaction' ? 'ArrowLeftRight' : 'Activity',
    title: notable.title,
    description: notable.description,
    badge: formatDate(notable.timestamp),
    linkedWidgetId: notable.type === 'transaction' ? 'recent-transactions' : 'activity-feed',
    actionLabel: 'See activity',
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns 3–5 briefing items sorted by priority.
 * The list always has at least a KPI summary item as the informational tail.
 */
export function getBriefingItems(): BriefingItem[] {
  const raw: BriefingItem[] = [
    ...buildAlertItems(),
    ...buildCaseItems(),
  ]

  const activity = buildActivityItem()
  if (activity) raw.push(activity)

  // De-duplicate by id and sort by priority
  const seen = new Set<string>()
  const unique = raw.filter(item => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })

  unique.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  // Cap at 4 items before appending the KPI summary, so total ≤ 5
  const top = unique.slice(0, 4)
  top.push(buildKPISummaryItem())

  return top
}

// ─── Briefing mode persistence ─────────────────────────────────────────────────

const LS_BRIEFING_KEY = 'pmfs_briefing_dismissed_date'

/**
 * Returns true if the briefing should be shown.
 * Briefing is shown at most once per calendar day — re-activates on a new day.
 */
export function shouldShowBriefing(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const stored = localStorage.getItem(LS_BRIEFING_KEY)
    if (!stored) return true
    const today = new Date().toDateString()
    return stored !== today
  } catch {
    return true
  }
}

/** Call this when the user dismisses the briefing for today */
export function dismissBriefingForToday(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_BRIEFING_KEY, new Date().toDateString())
  } catch {
    // localStorage may be unavailable — degrade gracefully
  }
}

/** Force the briefing to show again (e.g. user clicks "Return to briefing") */
export function resetBriefingDismissal(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(LS_BRIEFING_KEY)
  } catch {
    // ignore
  }
}
