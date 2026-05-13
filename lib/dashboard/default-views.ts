import type { DashboardView, DashboardWidgetInstance } from '@/lib/types/dashboard'

// ─── Helper ───────────────────────────────────────────────────────────────────

let _seq = 0
function inst(
  widgetId: DashboardWidgetInstance['widgetId'],
  size: DashboardWidgetInstance['size'],
  pinned = false,
): DashboardWidgetInstance {
  return {
    instanceId: `preset-${widgetId}-${++_seq}`,
    widgetId,
    size,
    pinned,
    visible: true,
  }
}

// ─── Preset Views ─────────────────────────────────────────────────────────────

/**
 * Morning Review — default view. Wide overview of firm health first thing.
 * Sized for a 4-col grid: medium pairs fill rows, full-width for tables/feeds.
 */
const morningReview: DashboardView = {
  id: 'preset-morning-review',
  name: 'Morning Review',
  description: 'Firm-wide health at a glance. Designed for the first 10 minutes of the day.',
  icon: 'Sunrise',
  isPreset: true,
  widgets: [
    inst('stats-cards', 'full'),
    inst('portfolio-chart', 'medium'),
    inst('allocation-chart', 'medium'),
    inst('alerts-panel', 'medium', true), // pinned — always visible
    inst('top-clients', 'medium'),
    inst('recent-transactions', 'full'),
    inst('activity-feed', 'full'),
  ],
}

/**
 * Client Risk Focus — for reviewing risk exposure across the book.
 * Alert panel pinned, allocation breakdown prominent.
 */
const clientRiskFocus: DashboardView = {
  id: 'preset-client-risk',
  name: 'Client Risk Focus',
  description: 'Risk exposure across all clients. Alerts and allocation are front and centre.',
  icon: 'ShieldAlert',
  isPreset: true,
  widgets: [
    inst('stats-cards', 'full'),
    inst('alerts-panel', 'medium', true), // pinned
    inst('allocation-chart', 'medium'),
    inst('top-clients', 'medium'),
    inst('activity-feed', 'medium'),
    inst('recent-transactions', 'full'),
  ],
}

/**
 * Advisor Performance — for reviewing the team.
 * Full-width staff table dominates, with activity feed alongside alerts.
 */
const advisorPerformance: DashboardView = {
  id: 'preset-advisor-performance',
  name: 'Advisor Performance',
  description: 'Team-level view. Advisor AUM, performance, and case load at a glance.',
  icon: 'Users',
  isPreset: true,
  widgets: [
    inst('stats-cards', 'full'),
    inst('alerts-panel', 'medium', true), // pinned
    inst('activity-feed', 'medium'),
    inst('staff-table', 'full'),
  ],
}

/**
 * End of Month — comprehensive month-close review.
 * All charts + full transactions ledger.
 */
const endOfMonth: DashboardView = {
  id: 'preset-end-of-month',
  name: 'End of Month',
  description: 'Comprehensive month-close view. Performance, allocation, revenue, and all activity.',
  icon: 'CalendarCheck',
  isPreset: true,
  widgets: [
    inst('stats-cards', 'full'),
    inst('portfolio-chart', 'medium'),
    inst('allocation-chart', 'medium'),
    inst('top-clients', 'medium'),
    inst('recent-transactions', 'full'),
    inst('staff-table', 'full'),
    inst('activity-feed', 'full'),
  ],
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const DEFAULT_VIEWS: DashboardView[] = [
  morningReview,
  clientRiskFocus,
  advisorPerformance,
  endOfMonth,
]

export const DEFAULT_ACTIVE_VIEW_ID = morningReview.id

/**
 * Returns a deep clone of the preset views, safe to mutate.
 * Used when resetting a preset view to its default configuration.
 */
export function getPresetDefaults(): DashboardView[] {
  return JSON.parse(JSON.stringify(DEFAULT_VIEWS)) as DashboardView[]
}
