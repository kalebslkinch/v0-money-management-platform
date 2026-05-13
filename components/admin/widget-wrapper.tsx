'use client'

import React from 'react'
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

/** Props passed down from SortableWidgetCell — the drag behaviour owner */
export interface DragHandleProps {
  attributes: Record<string, unknown>
  listeners: Record<string, unknown> | undefined
}
interface WidgetWrapperProps {
  instanceId: string
  widgetId: WidgetId
  size: WidgetSize
  pinned: boolean
  autoPromoted: boolean
  isEditMode: boolean
  isDragging: boolean
  dragHandleProps: DragHandleProps
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
  isDragging,
  dragHandleProps,
  onSizeChange,
  onTogglePin,
  onRemove,
  children,
}: WidgetWrapperProps) {
  const config = WIDGET_REGISTRY[widgetId]
  const minSize = config.minSize

  return (
    <div
      className={cn(
        // Base: borderless white card, very soft shadow — Monzo aesthetic
        'group relative flex flex-col rounded-2xl bg-card transition-all duration-200 h-full',
        'shadow-[0_1px_4px_0_rgb(0_0_0/0.06),0_1px_2px_-1px_rgb(0_0_0/0.05)]',
        'hover:shadow-[0_4px_12px_-2px_rgb(0_0_0/0.08),0_2px_4px_-2px_rgb(0_0_0/0.05)]',
        // Auto-promoted: warm amber glow
        autoPromoted && 'shadow-[0_0_0_2px_rgb(251_191_36/0.35),0_4px_12px_-2px_rgb(251_191_36/0.15)]',
        // Pinned: subtle primary glow
        pinned && !autoPromoted && 'shadow-[0_0_0_2px_rgb(var(--primary)/0.2),0_4px_12px_-2px_rgb(var(--primary)/0.08)]',
        // Edit mode: dashed outline + slight scale hint
        isEditMode && 'ring-2 ring-primary/25 ring-offset-2 ring-offset-background cursor-grab active:cursor-grabbing',
        // Dragging: fade the source cell
        isDragging && 'opacity-40',
      )}
    >
      {/* ── Edit Mode Header Bar ── */}
      {isEditMode && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-border/30 bg-primary/[0.03] rounded-t-2xl">
          {/* Drag handle */}
          <div
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
            className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing select-none text-muted-foreground/70 hover:text-foreground transition-colors min-w-0"
            title="Drag to reorder"
          >
            <GripVertical className="size-3.5 shrink-0" />
            <span className="text-[11px] font-medium truncate">{config.label}</span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {/* Size selector — shows current size as "2×", "Full", etc. */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px] rounded-lg gap-1 text-muted-foreground hover:text-foreground font-mono"
                >
                  {WIDGET_SIZE_LABELS[size]}
                  <ChevronDown className="size-2.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 rounded-xl">
                <DropdownMenuLabel className="text-[10px] text-muted-foreground pb-1">Width</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {WIDGET_SIZES.map(s => {
                  const sizeOrder: WidgetSize[] = ['small', 'medium', 'large', 'full']
                  const isDisabled = sizeOrder.indexOf(s) < sizeOrder.indexOf(minSize)
                  return (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => !isDisabled && onSizeChange(instanceId, s)}
                      className={cn(
                        'text-[11px] rounded-lg font-mono',
                        s === size && 'bg-primary/10 text-primary font-semibold',
                        isDisabled && 'opacity-35 cursor-not-allowed',
                      )}
                    >
                      {WIDGET_SIZE_LABELS[s]}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Pin toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'size-6 rounded-lg',
                pinned
                  ? 'text-primary hover:text-muted-foreground'
                  : 'text-muted-foreground/60 hover:text-foreground',
              )}
              onClick={() => onTogglePin(instanceId)}
              title={pinned ? 'Unpin' : 'Pin to top'}
            >
              {pinned ? <PinOff className="size-3" /> : <Pin className="size-3" />}
            </Button>

            {/* Remove */}
            <Button
              variant="ghost"
              size="icon"
              className="size-6 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/8"
              onClick={() => onRemove(instanceId)}
              title="Remove widget"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Status indicators (non-edit mode) — minimal dot badges ── */}
      {!isEditMode && (pinned || autoPromoted) && (
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
          {autoPromoted && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-semibold tracking-wide">
              <AlertTriangle className="size-2" />
              Alert
            </span>
          )}
          {pinned && !autoPromoted && (
            <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary">
              <Pin className="size-2.5" />
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
