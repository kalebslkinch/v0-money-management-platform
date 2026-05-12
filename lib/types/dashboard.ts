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

/** Maps WidgetSize to how many columns the widget spans in the 12-col grid */
export const WIDGET_COLUMN_SPANS: Record<WidgetSize, number> = {
  small: 4,
  medium: 6,
  large: 8,
  full: 12,
}

/** Human-readable labels for the size picker */
export const WIDGET_SIZE_LABELS: Record<WidgetSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  full: 'Full Width',
}

export const WIDGET_SIZES: WidgetSize[] = ['small', 'medium', 'large', 'full']
