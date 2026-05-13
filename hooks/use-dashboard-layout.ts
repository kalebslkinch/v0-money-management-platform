import { useState, useCallback, useEffect, useMemo } from 'react'
import type {
  DashboardState,
  DashboardView,
  DashboardWidgetInstance,
  WidgetId,
  WidgetSize,
} from '@/lib/types/dashboard'
import { DEFAULT_VIEWS, DEFAULT_ACTIVE_VIEW_ID, getPresetDefaults } from '@/lib/dashboard/default-views'
import { WIDGET_REGISTRY } from '@/lib/dashboard/widget-registry'
import { alerts } from '@/lib/data/mock-analytics'

const LS_STATE_KEY = 'pmfs_dashboard_state'
const LS_VIEW_KEY = 'pmfs_active_view_id'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeInstanceId(): string {
  return `widget-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function loadPersistedState(): DashboardState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_STATE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DashboardState
    // Merge any new preset views that may not be in the persisted state
    const existingIds = new Set(parsed.views.map(v => v.id))
    const missingPresets = DEFAULT_VIEWS.filter(v => !existingIds.has(v.id))
    if (missingPresets.length > 0) {
      parsed.views = [...missingPresets, ...parsed.views]
    }
    return parsed
  } catch {
    return null
  }
}

function persistState(state: DashboardState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_STATE_KEY, JSON.stringify({ ...state, editMode: false }))
    localStorage.setItem(LS_VIEW_KEY, state.activeViewId)
  } catch {
    // localStorage may be unavailable — degrade gracefully
  }
}

function buildInitialState(): DashboardState {
  const persisted = loadPersistedState()
  if (persisted) return { ...persisted, editMode: false }
  return {
    activeViewId: DEFAULT_ACTIVE_VIEW_ID,
    views: getPresetDefaults(),
    editMode: false,
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboardLayout() {
  const [state, setState] = useState<DashboardState>(buildInitialState)

  // Persist on every state change (skip editMode to avoid persisting transient state)
  useEffect(() => {
    persistState(state)
  }, [state])

  // ── Derived ────────────────────────────────────────────────────────────────

  const activeView = useMemo(
    () => state.views.find(v => v.id === state.activeViewId) ?? state.views[0],
    [state.activeViewId, state.views],
  )

  /**
   * Auto-promotion: if any danger alert exists, the alerts-panel widget
   * is treated as if it were pinned (visual accent + sort-to-front).
   */
  const hasDangerAlert = useMemo(() => alerts.some(a => a.type === 'danger'), [])

  const autoPromotedWidgetIds = useMemo<Set<WidgetId>>(
    () => (hasDangerAlert ? new Set<WidgetId>(['alerts-panel']) : new Set<WidgetId>()),
    [hasDangerAlert],
  )

  /** Visible widgets, with pinned/auto-promoted floated to the front */
  const sortedWidgets = useMemo<DashboardWidgetInstance[]>(() => {
    if (!activeView) return []
    const visible = activeView.widgets.filter(w => w.visible)
    const pinned = visible.filter(w => w.pinned || autoPromotedWidgetIds.has(w.widgetId))
    const rest = visible.filter(w => !w.pinned && !autoPromotedWidgetIds.has(w.widgetId))
    return [...pinned, ...rest]
  }, [activeView, autoPromotedWidgetIds])

  // ── State Updaters ────────────────────────────────────────────────────────

  const updateActiveView = useCallback(
    (updater: (view: DashboardView) => DashboardView) => {
      setState(prev => ({
        ...prev,
        views: prev.views.map(v => (v.id === prev.activeViewId ? updater(v) : v)),
      }))
    },
    [],
  )

  // ── Public API ────────────────────────────────────────────────────────────

  const setActiveView = useCallback((id: string) => {
    setState(prev => ({ ...prev, activeViewId: id, editMode: false }))
  }, [])

  const setEditMode = useCallback((on: boolean) => {
    setState(prev => ({ ...prev, editMode: on }))
  }, [])

  /** Called by DndContext onDragEnd — reorders ALL widgets in the active view */
  const reorderWidgets = useCallback(
    (newOrder: DashboardWidgetInstance[]) => {
      updateActiveView(view => ({
        ...view,
        widgets: newOrder,
      }))
    },
    [updateActiveView],
  )

  const setWidgetSize = useCallback(
    (instanceId: string, size: WidgetSize) => {
      updateActiveView(view => ({
        ...view,
        widgets: view.widgets.map(w =>
          w.instanceId === instanceId ? { ...w, size } : w,
        ),
      }))
    },
    [updateActiveView],
  )

  const toggleWidgetPin = useCallback(
    (instanceId: string) => {
      updateActiveView(view => ({
        ...view,
        widgets: view.widgets.map(w =>
          w.instanceId === instanceId ? { ...w, pinned: !w.pinned } : w,
        ),
      }))
    },
    [updateActiveView],
  )

  const toggleWidgetVisibility = useCallback(
    (instanceId: string) => {
      updateActiveView(view => ({
        ...view,
        widgets: view.widgets.map(w =>
          w.instanceId === instanceId ? { ...w, visible: !w.visible } : w,
        ),
      }))
    },
    [updateActiveView],
  )

  const addWidget = useCallback(
    (widgetId: WidgetId) => {
      const config = WIDGET_REGISTRY[widgetId]
      const newInstance: DashboardWidgetInstance = {
        instanceId: makeInstanceId(),
        widgetId,
        size: config.defaultSize,
        pinned: false,
        visible: true,
      }
      updateActiveView(view => ({
        ...view,
        widgets: [...view.widgets, newInstance],
      }))
    },
    [updateActiveView],
  )

  const removeWidget = useCallback(
    (instanceId: string) => {
      updateActiveView(view => ({
        ...view,
        widgets: view.widgets.filter(w => w.instanceId !== instanceId),
      }))
    },
    [updateActiveView],
  )

  const saveAsNewView = useCallback(
    (name: string, description: string) => {
      const newView: DashboardView = {
        id: makeInstanceId(),
        name: name.trim(),
        description: description.trim(),
        icon: 'LayoutTemplate',
        isPreset: false,
        // Deep clone current view widgets with fresh instance IDs
        widgets: (activeView?.widgets ?? []).map(w => ({
          ...w,
          instanceId: makeInstanceId(),
        })),
      }
      setState(prev => ({
        ...prev,
        activeViewId: newView.id,
        views: [...prev.views, newView],
      }))
    },
    [activeView],
  )

  const deleteView = useCallback((id: string) => {
    setState(prev => {
      const view = prev.views.find(v => v.id === id)
      if (!view || view.isPreset) return prev
      const remaining = prev.views.filter(v => v.id !== id)
      const newActiveId =
        prev.activeViewId === id ? (remaining[0]?.id ?? DEFAULT_ACTIVE_VIEW_ID) : prev.activeViewId
      return { ...prev, views: remaining, activeViewId: newActiveId }
    })
  }, [])

  const resetView = useCallback((id: string) => {
    const presetDefaults = getPresetDefaults()
    const original = presetDefaults.find(v => v.id === id)
    if (!original) return
    setState(prev => ({
      ...prev,
      views: prev.views.map(v => (v.id === id ? { ...original } : v)),
    }))
  }, [])

  // ── Widget presence helpers (used by widget picker) ───────────────────────

  const visibleWidgetIds = useMemo<Set<WidgetId>>(
    () => new Set(activeView?.widgets.filter(w => w.visible).map(w => w.widgetId) ?? []),
    [activeView],
  )

  const widgetExistsInView = useCallback(
    (widgetId: WidgetId) =>
      activeView?.widgets.some(w => w.widgetId === widgetId && w.visible) ?? false,
    [activeView],
  )

  /** Removes all instances of a widgetId from the current view */
  const removeWidgetByType = useCallback(
    (widgetId: WidgetId) => {
      updateActiveView(view => ({
        ...view,
        widgets: view.widgets.filter(w => w.widgetId !== widgetId),
      }))
    },
    [updateActiveView],
  )

  return {
    state,
    activeView,
    sortedWidgets,
    autoPromotedWidgetIds,
    editMode: state.editMode,
    setActiveView,
    setEditMode,
    reorderWidgets,
    setWidgetSize,
    toggleWidgetPin,
    toggleWidgetVisibility,
    addWidget,
    removeWidget,
    saveAsNewView,
    deleteView,
    resetView,
    visibleWidgetIds,
    widgetExistsInView,
    removeWidgetByType,
  }
}

export type DashboardLayoutAPI = ReturnType<typeof useDashboardLayout>
