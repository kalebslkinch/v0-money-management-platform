'use client'

import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { WidgetWrapper } from '@/components/admin/widget-wrapper'
import { renderWidget, WIDGET_REGISTRY } from '@/lib/dashboard/widget-registry'
import { WIDGET_COLUMN_SPANS } from '@/lib/types/dashboard'
import type { DashboardLayoutAPI } from '@/hooks/use-dashboard-layout'
import type { DashboardWidgetInstance } from '@/lib/types/dashboard'

// ─── Props ────────────────────────────────────────────────────────────────────

interface DashboardGridProps {
  layout: DashboardLayoutAPI
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardGrid({ layout }: DashboardGridProps) {
  const {
    sortedWidgets,
    activeView,
    autoPromotedWidgetIds,
    editMode,
    setWidgetSize,
    toggleWidgetPin,
    removeWidget,
    reorderWidgets,
  } = layout

  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id || !activeView) return

    // Reorder within the *full* widget list (including hidden) to preserve hidden widget positions
    const allWidgets = activeView.widgets
    const activeIndex = allWidgets.findIndex(w => w.instanceId === active.id)
    const overIndex = allWidgets.findIndex(w => w.instanceId === over.id)

    if (activeIndex !== -1 && overIndex !== -1) {
      reorderWidgets(arrayMove(allWidgets, activeIndex, overIndex))
    }
  }

  const activeWidget = activeId
    ? sortedWidgets.find(w => w.instanceId === activeId)
    : null

  if (!activeView) return null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedWidgets.map(w => w.instanceId)}
        strategy={rectSortingStrategy}
      >
        {/*
          12-column grid. Widgets declare their own column span via size.
          On smaller screens everything collapses to full width.
        */}
        <div className="grid grid-cols-12 gap-6 auto-rows-auto">
          {sortedWidgets.map(widget => {
            const colSpan = WIDGET_COLUMN_SPANS[widget.size]
            const isAutoPromoted = autoPromotedWidgetIds.has(widget.widgetId)

            return (
              <div
                key={widget.instanceId}
                className={`col-span-12 lg:col-span-${colSpan}`}
                style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}
              >
                <WidgetWrapper
                  instanceId={widget.instanceId}
                  widgetId={widget.widgetId}
                  size={widget.size}
                  pinned={widget.pinned}
                  autoPromoted={isAutoPromoted}
                  isEditMode={editMode}
                  onSizeChange={setWidgetSize}
                  onTogglePin={toggleWidgetPin}
                  onRemove={removeWidget}
                >
                  {renderWidget(widget.widgetId, widget.size)}
                </WidgetWrapper>
              </div>
            )
          })}
        </div>
      </SortableContext>

      {/* Drag overlay — renders a ghost of the widget being dragged */}
      <DragOverlay>
        {activeWidget ? (
          <DragGhost widget={activeWidget} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// ─── Drag Ghost ───────────────────────────────────────────────────────────────

function DragGhost({ widget }: { widget: DashboardWidgetInstance }) {
  const config = WIDGET_REGISTRY[widget.widgetId]
  return (
    <div className="rounded-2xl bg-card border border-primary/40 shadow-2xl shadow-primary/20 p-4 opacity-90 rotate-1 ring-2 ring-primary/30">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <div className="size-2 rounded-full bg-primary animate-pulse" />
        {config.label}
      </div>
    </div>
  )
}
