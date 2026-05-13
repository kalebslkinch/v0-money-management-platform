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
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
        strategy={verticalListSortingStrategy}
      >
        {/*
          12-column grid. Each cell is the sortable element — setNodeRef lives
          on the grid cell div so dnd-kit measures and transforms the element
          that CSS Grid is actually positioning. WidgetWrapper is presentational.
        */}
        <div className="grid grid-cols-12 gap-6">
          {sortedWidgets.map(widget => {
            const isAutoPromoted = autoPromotedWidgetIds.has(widget.widgetId)
            return (
              <SortableWidgetCell
                key={widget.instanceId}
                widget={widget}
                isAutoPromoted={isAutoPromoted}
                isEditMode={editMode}
                onSizeChange={setWidgetSize}
                onTogglePin={toggleWidgetPin}
                onRemove={removeWidget}
              />
            )
          })}
        </div>
      </SortableContext>

      {/* Drag overlay — polished ghost card, sized to the dragged widget */}
      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
        {activeWidget ? <DragGhost widget={activeWidget} /> : null}
      </DragOverlay>
    </DndContext>
  )
}

// ─── SortableWidgetCell ────────────────────────────────────────────────────────────

/**
 * Owns useSortable for a single widget. Applies setNodeRef + CSS transform
 * directly to the grid cell div — the element CSS Grid actually positions.
 * Passes drag handle props down to WidgetWrapper (presentational only).
 */
interface SortableWidgetCellProps {
  widget: DashboardWidgetInstance
  isAutoPromoted: boolean
  isEditMode: boolean
  onSizeChange: (instanceId: string, size: DashboardWidgetInstance['size']) => void
  onTogglePin: (instanceId: string) => void
  onRemove: (instanceId: string) => void
}

function SortableWidgetCell({
  widget,
  isAutoPromoted,
  isEditMode,
  onSizeChange,
  onTogglePin,
  onRemove,
}: SortableWidgetCellProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.instanceId, disabled: !isEditMode })

  const colSpan = WIDGET_COLUMN_SPANS[widget.size]

  const cellStyle: React.CSSProperties = {
    gridColumn: `span ${colSpan} / span ${colSpan}`,
    transform: CSS.Transform.toString(transform),
    transition,
    // Keep the grid cell in flow so other cells don't collapse into its space
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative',
  }

  return (
    <div ref={setNodeRef} style={cellStyle}>
      <WidgetWrapper
        instanceId={widget.instanceId}
        widgetId={widget.widgetId}
        size={widget.size}
        pinned={widget.pinned}
        autoPromoted={isAutoPromoted}
        isEditMode={isEditMode}
        isDragging={isDragging}
        dragHandleProps={{ attributes: attributes as unknown as Record<string, unknown>, listeners }}
        onSizeChange={onSizeChange}
        onTogglePin={onTogglePin}
        onRemove={onRemove}
      >
        {renderWidget(widget.widgetId, widget.size)}
      </WidgetWrapper>
    </div>
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
