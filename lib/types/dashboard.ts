// ─── Widget System ────────────────────────────────────────────────────────────

export type WidgetId =
  | 'stats-cards'
  | 'portfolio-chart'
  | 'allocation-chart'
  | 'recent-transactions'
  | 'activity-feed'
  | 'alerts-panel'
  | 'top-clients'
  | 'staff-table'

export type WidgetSize = 'small' | 'medium' | 'large' | 'full'

export type WidgetCategory = 'kpi' | 'chart' | 'data' | 'alerts'

/** Static definition for a widget type — registered once in the widget registry */
export interface WidgetConfig {
  id: WidgetId
  label: string
  description: string
  category: WidgetCategory
  defaultSize: WidgetSize
  /** Minimum size this widget can be reduced to */
  minSize: WidgetSize
  /** If true, this widget will be auto-elevated when threshold conditions are met */
  autoPromote?: boolean
  /** Icon name from lucide-react */
  icon: string
}

// ─── Dashboard Instance Types ─────────────────────────────────────────────────

/** A widget instance inside a named view — carries runtime state */
export interface DashboardWidgetInstance {
  /** Unique instance id within a view (use crypto.randomUUID() or a stable id) */
  instanceId: string
  widgetId: WidgetId
  size: WidgetSize
  pinned: boolean
  visible: boolean
}

// ─── Views ────────────────────────────────────────────────────────────────────

export interface DashboardView {
  id: string
  name: string
  description: string
  /** Lucide icon name for the tab */
  icon: string
  /** Preset views cannot be deleted, only reset to their default widget config */
  isPreset: boolean
  widgets: DashboardWidgetInstance[]
}

// ─── Global Dashboard State ───────────────────────────────────────────────────

export interface DashboardState {
  activeViewId: string
  views: DashboardView[]
  editMode: boolean
}

// ─── Widget Size → Grid Column Spans ─────────────────────────────────────────

/** Maps WidgetSize to how many columns the widget spans in the 4-col grid */
export const WIDGET_COLUMN_SPANS: Record<WidgetSize, number> = {
  small: 1,   // ¼ width
  medium: 2,  // ½ width
  large: 3,   // ¾ width
  full: 4,    // full width
}

/** Human-readable labels for the size picker */
export const WIDGET_SIZE_LABELS: Record<WidgetSize, string> = {
  small: '1×',
  medium: '2×',
  large: '3×',
  full: 'Full',
}

export const WIDGET_SIZES: WidgetSize[] = ['small', 'medium', 'large', 'full']

// ─── Daily Briefing ───────────────────────────────────────────────────────────

export type BriefingPriority = 'critical' | 'high' | 'medium' | 'info'

/** A single prioritised item surfaced in the daily briefing view */
export interface BriefingItem {
  id: string
  priority: BriefingPriority
  /** Lucide icon name */
  icon: string
  title: string
  description: string
  /** Short contextual badge, e.g. "Due Jan 31" or "2 alerts" */
  badge?: string
  /** The widget to scroll/jump to when the user clicks the item's CTA */
  linkedWidgetId?: WidgetId
  /** Label for the action button */
  actionLabel?: string
}
