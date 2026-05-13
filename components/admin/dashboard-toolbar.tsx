'use client'

import React, { useState } from 'react'
import {
  Sunrise,
  ShieldAlert,
  Users,
  CalendarCheck,
  LayoutTemplate,
  Settings2,
  LayoutDashboard,
  Plus,
  Check,
  Save,
  X,
  RotateCcw,
  Calendar,
  SunMedium,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { WidgetPicker } from '@/components/admin/widget-picker'
import type { DashboardLayoutAPI } from '@/hooks/use-dashboard-layout'

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const VIEW_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sunrise,
  ShieldAlert,
  Users,
  CalendarCheck,
  LayoutTemplate,
  LayoutDashboard,
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DashboardToolbarProps {
  layout: DashboardLayoutAPI
  managerName?: string
  onReturnToBriefing?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardToolbar({ layout, managerName = 'James', onReturnToBriefing }: DashboardToolbarProps) {
  const {
    state,
    activeView,
    editMode,
    setActiveView,
    setEditMode,
    saveAsNewView,
    deleteView,
    resetView,
  } = layout

  const [pickerOpen, setPickerOpen] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [newViewName, setNewViewName] = useState('')
  const [newViewDesc, setNewViewDesc] = useState('')

  function handleSaveView() {
    if (!newViewName.trim()) return
    saveAsNewView(newViewName, newViewDesc)
    setNewViewName('')
    setNewViewDesc('')
    setSaveDialogOpen(false)
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <TooltipProvider delayDuration={400}>
      <div className="px-6 md:px-8 pt-6 md:pt-8 pb-0">
        <div className="mx-auto max-w-7xl">
          {/* ── Page Header — Monzo-clean: greeting + name on one line, view description below ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl font-bold tracking-tight truncate">
                  {managerName}
                </h1>
                <span className="text-muted-foreground text-sm hidden sm:inline">· Good morning</span>
              </div>
              <p className="text-muted-foreground text-sm mt-0.5 truncate">
                {activeView?.description ?? "Here's what's happening with your customers' budgets today."}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] text-muted-foreground text-xs">
                <Calendar className="size-3.5" />
                <span>{today}</span>
              </div>
            </div>
          </div>

          {/* ── View Tabs + Edit Controls ── */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-border/40">
            {/* Named View Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {state.views.map(view => {
                const Icon = VIEW_ICON_MAP[view.icon] ?? LayoutTemplate
                const isActive = view.id === state.activeViewId

                return (
                  <div key={view.id} className="relative flex items-center group/tab">
                    <button
                      onClick={() => setActiveView(view.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150',
                        isActive
                          ? 'bg-foreground text-background shadow-sm'
                          : 'bg-card shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] text-muted-foreground hover:text-foreground',
                        !view.isPreset && isActive && 'pr-6',
                      )}
                    >
                      <Icon className="size-3 shrink-0" />
                      <span>{view.name}</span>
                      {view.isPreset && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] h-3.5 px-1 rounded-full border ml-0.5',
                            isActive
                              ? 'border-background/30 text-background/60 bg-background/10'
                              : 'border-border/50 text-muted-foreground/50',
                          )}
                        >
                          Preset
                        </Badge>
                      )}
                    </button>

                    {/* Delete button for custom views */}
                    {!view.isPreset && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => deleteView(view.id)}
                            className={cn(
                              'absolute right-1 size-4 flex items-center justify-center rounded-full',
                              'text-background/60 hover:text-background hover:bg-background/20',
                              'transition-all duration-150',
                              !isActive && 'hidden',
                            )}
                          >
                            <X className="size-2.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Delete view</TooltipContent>
                      </Tooltip>
                    )}

                    {/* Reset button for preset views (shown on hover when active) */}
                    {view.isPreset && isActive && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => resetView(view.id)}
                            className="absolute -top-1.5 -right-1.5 size-4 flex items-center justify-center rounded-full bg-card border border-border/50 text-muted-foreground hover:text-foreground opacity-0 group-hover/tab:opacity-100 transition-opacity duration-150"
                          >
                            <RotateCcw className="size-2.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">Reset to default</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Edit mode controls */}
            <div className="flex items-center gap-2">
              {editMode ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-xl gap-1.5 text-xs"
                    onClick={() => setPickerOpen(true)}
                  >
                    <Plus className="size-3.5" />
                    Add Widget
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-xl gap-1.5 text-xs"
                    onClick={() => setSaveDialogOpen(true)}
                  >
                    <Save className="size-3.5" />
                    Save as View
                  </Button>

                  <Button
                    size="sm"
                    className="h-8 rounded-xl gap-1.5 text-xs bg-primary text-primary-foreground"
                    onClick={() => setEditMode(false)}
                  >
                    <Check className="size-3.5" />
                    Done
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  {onReturnToBriefing && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-xl gap-1.5 text-xs"
                          onClick={onReturnToBriefing}
                        >
                          <SunMedium className="size-3.5" />
                          Briefing
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">Return to daily briefing</TooltipContent>
                    </Tooltip>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-xl gap-1.5 text-xs"
                    onClick={() => setEditMode(true)}
                  >
                    <Settings2 className="size-3.5" />
                    Customise
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Edit mode instruction strip */}
          {editMode && (
            <div className="flex items-center gap-2 py-2 px-3.5 mt-2.5 rounded-xl bg-primary/6 border border-primary/15 text-primary text-[11px] font-medium">
              <Settings2 className="size-3 shrink-0" />
              <span>Edit mode — drag to reorder, tap the size picker to resize, pin to lock position. Hit <strong>Done</strong> when finished.</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Widget Picker Drawer ── */}
      <WidgetPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        layout={layout}
      />

      {/* ── Save as View Dialog ── */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Save as New View</DialogTitle>
            <DialogDescription>
              Creates a new named view from the current widget layout and arrangement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">View Name</label>
              <Input
                placeholder="e.g. Friday Wrap-up"
                value={newViewName}
                onChange={e => setNewViewName(e.target.value)}
                className="rounded-xl"
                onKeyDown={e => e.key === 'Enter' && handleSaveView()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Description <span className="text-muted-foreground/60 font-normal">(optional)</span>
              </label>
              <Input
                placeholder="What is this view for?"
                value={newViewDesc}
                onChange={e => setNewViewDesc(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl"
              onClick={handleSaveView}
              disabled={!newViewName.trim()}
            >
              <Save className="size-4 mr-2" />
              Save View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
