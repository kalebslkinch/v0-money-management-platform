'use client'

import React from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  ArrowLeftRight,
  Activity,
  ShieldAlert,
  Star,
  Users,
  Check,
  Plus,
  Minus,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { WIDGET_REGISTRY, WIDGET_PICKER_ORDER } from '@/lib/dashboard/widget-registry'
import type { WidgetId } from '@/lib/types/dashboard'
import type { DashboardLayoutAPI } from '@/hooks/use-dashboard-layout'

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  ArrowLeftRight,
  Activity,
  ShieldAlert,
  Star,
  Users,
}

const CATEGORY_LABELS: Record<string, string> = {
  kpi: 'KPI',
  chart: 'Chart',
  data: 'Data',
  alerts: 'Alerts',
}

const CATEGORY_STYLES: Record<string, string> = {
  kpi: 'bg-primary/10 text-primary border-primary/20',
  chart: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  data: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  alerts: 'bg-destructive/10 text-destructive border-destructive/20',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface WidgetPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  layout: DashboardLayoutAPI
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WidgetPicker({ open, onOpenChange, layout }: WidgetPickerProps) {
  const { widgetExistsInView, addWidget, removeWidgetByType } = layout

  function handleToggle(widgetId: WidgetId) {
    if (widgetExistsInView(widgetId)) {
      removeWidgetByType(widgetId)
    } else {
      addWidget(widgetId)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col gap-0 p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <SheetTitle className="text-lg">Add Widgets</SheetTitle>
          <SheetDescription className="text-sm">
            Toggle widgets to include or remove them from your current view.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {WIDGET_PICKER_ORDER.map(widgetId => {
              const config = WIDGET_REGISTRY[widgetId]
              const isActive = widgetExistsInView(widgetId)
              const Icon = ICON_MAP[config.icon] ?? LayoutDashboard

              return (
                <div
                  key={widgetId}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer',
                    isActive
                      ? 'border-primary/30 bg-primary/5 hover:bg-primary/8'
                      : 'border-border/50 bg-card hover:border-border hover:bg-accent/30',
                  )}
                  onClick={() => handleToggle(widgetId)}
                >
                  {/* Icon */}
                  <div className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl border',
                    isActive
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : 'bg-accent border-border/50 text-muted-foreground',
                  )}>
                    <Icon className="size-4" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold leading-tight">{config.label}</span>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] h-4 px-1.5 rounded-full border', CATEGORY_STYLES[config.category])}
                      >
                        {CATEGORY_LABELS[config.category]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{config.description}</p>
                  </div>

                  {/* Toggle button */}
                  <Button
                    variant={isActive ? 'default' : 'outline'}
                    size="icon"
                    className={cn(
                      'size-8 shrink-0 rounded-lg',
                      isActive && 'bg-primary hover:bg-primary/90',
                    )}
                    onClick={e => {
                      e.stopPropagation()
                      handleToggle(widgetId)
                    }}
                  >
                    {isActive ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Changes apply immediately to the current view
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
