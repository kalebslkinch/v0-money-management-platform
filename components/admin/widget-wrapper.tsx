'use client'

import React, { useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Pin,
  PinOff,
  Trash2,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { WIDGET_SIZES, WIDGET_SIZE_LABELS } from '@/lib/types/dashboard'
import type { WidgetSize, WidgetId } from '@/lib/types/dashboard'
import { WIDGET_REGISTRY } from '@/lib/dashboard/widget-registry'

// ─── Props ────────────────────────────────────────────────────────────────────

interface WidgetWrapperProps {
  instanceId: string
  widgetId: WidgetId
  size: WidgetSize
  pinned: boolean
  autoPromoted: boolean
  isEditMode: boolean
  onSizeChange: (instanceId: string, size: WidgetSize) => void
  onTogglePin: (instanceId: string) => void
  onRemove: (instanceId: string) => void
  children: React.ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WidgetWrapper({
  instanceId,
  widgetId,
  size,
  pinned,
  autoPromoted,
  isEditMode,
  onSizeChange,
  onTogglePin,
  onRemove,
  children,
}: WidgetWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: instanceId, disabled: !isEditMode })

  const config = WIDGET_REGISTRY[widgetId]
  const canBePinned = pinned !== undefined // all widgets are pinnable
  const minSize = config.minSize

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex flex-col rounded-2xl bg-card border transition-all duration-200',
        // Normal border
        !autoPromoted && 'border-border/50',
        // Auto-promoted: amber left accent
        autoPromoted && !pinned && 'border-amber-500/40 border-l-4 border-l-amber-500 shadow-amber-500/10 shadow-md',
        // Pinned: subtle primary accent
        pinned && !autoPromoted && 'border-primary/30 shadow-primary/5 shadow-md',
        // Both
        pinned && autoPromoted && 'border-amber-500/40 border-l-4 border-l-amber-500 shadow-amber-500/10 shadow-md',
        // Edit mode ring
        isEditMode && 'ring-1 ring-primary/20 hover:ring-primary/40',
        // Dragging ghost
        isDragging && 'shadow-2xl',
      )}
    >
      {/* ── Edit Mode Header Bar ── */}
      {isEditMode && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/40 bg-accent/30 rounded-t-2xl">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing select-none text-muted-foreground hover:text-foreground transition-colors"
            title="Drag to reorder"
          >
            <GripVertical className="size-4 shrink-0" />
            <span className="text-xs font-medium truncate max-w-[140px]">{config.label}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Size selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs rounded-lg gap-1 text-muted-foreground hover:text-foreground"
                >
                  {WIDGET_SIZE_LABELS[size]}
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 rounded-xl">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Widget Size</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {WIDGET_SIZES.map(s => {
                  const sizeOrder: WidgetSize[] = ['small', 'medium', 'large', 'full']
                  const isDisabled = sizeOrder.indexOf(s) < sizeOrder.indexOf(minSize)
                  return (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => !isDisabled && onSizeChange(instanceId, s)}
                      className={cn(
                        'text-xs rounded-lg',
                        s === size && 'bg-primary/10 text-primary font-medium',
                        isDisabled && 'opacity-40 cursor-not-allowed',
                      )}
                    >
                      {WIDGET_SIZE_LABELS[s]}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Pin toggle */}
            {canBePinned && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'size-7 rounded-lg',
                  pinned
                    ? 'text-primary hover:text-muted-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => onTogglePin(instanceId)}
                title={pinned ? 'Unpin widget' : 'Pin widget to top'}
              >
                {pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
              </Button>
            )}

            {/* Remove */}
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemove(instanceId)}
              title="Remove widget"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Status Badges (non-edit mode) ── */}
      {!isEditMode && (pinned || autoPromoted) && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {autoPromoted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 text-[10px] font-semibold">
              <AlertTriangle className="size-2.5" />
              Auto-promoted
            </span>
          )}
          {pinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold">
              <Pin className="size-2.5" />
              Pinned
            </span>
          )}
        </div>
      )}

      {/* ── Widget Content ── */}
      <div className={cn('flex-1 min-h-0', isEditMode && 'pointer-events-none select-none')}>
        {children}
      </div>
    </div>
  )
}
