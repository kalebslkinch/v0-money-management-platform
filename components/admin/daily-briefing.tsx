'use client'

import React, { useMemo } from 'react'
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  TrendingUp,
  ArrowLeftRight,
  Activity,
  FileWarning,
  ClipboardList,
  ArrowRight,
  Sparkles,
  Calendar,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getBriefingItems } from '@/lib/dashboard/briefing-engine'
import type { BriefingItem, BriefingPriority } from '@/lib/types/dashboard'

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldAlert,
  AlertTriangle,
  Info,
  TrendingUp,
  ArrowLeftRight,
  Activity,
  FileWarning,
  ClipboardList,
}

// ─── Priority Config ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<
  BriefingPriority,
  { label: string; dot: string; border: string; bg: string; badgeClass: string }
> = {
  critical: {
    label: 'Critical',
    dot: 'bg-destructive',
    border: 'border-destructive/30',
    bg: 'bg-destructive/5',
    badgeClass: 'border-destructive/30 text-destructive bg-destructive/10',
  },
  high: {
    label: 'High',
    dot: 'bg-chart-4',
    border: 'border-chart-4/30',
    bg: 'bg-chart-4/5',
    badgeClass: 'border-chart-4/30 text-chart-4 bg-chart-4/10',
  },
  medium: {
    label: 'Action',
    dot: 'bg-primary',
    border: 'border-primary/20',
    bg: 'bg-primary/5',
    badgeClass: 'border-primary/20 text-primary bg-primary/10',
  },
  info: {
    label: 'Summary',
    dot: 'bg-muted-foreground',
    border: 'border-border/50',
    bg: 'bg-card',
    badgeClass: 'border-border/50 text-muted-foreground',
  },
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DailyBriefingProps {
  userName: string
  onExpand: () => void
}

// ─── Briefing Card ────────────────────────────────────────────────────────────

function BriefingCard({
  item,
  index,
  onExpand,
}: {
  item: BriefingItem
  index: number
  onExpand: () => void
}) {
  const config = PRIORITY_CONFIG[item.priority]
  const Icon = ICON_MAP[item.icon] ?? Info
  const isCritical = item.priority === 'critical'

  return (
    <div
      className={cn(
        'group relative flex items-start gap-4 rounded-2xl border p-5 transition-all duration-200',
        'hover:shadow-sm hover:border-border',
        config.border,
        config.bg,
        isCritical && 'ring-1 ring-destructive/20',
      )}
    >
      {/* Priority number + icon */}
      <div className="flex flex-col items-center gap-2 pt-0.5 shrink-0">
        <span className="text-xs font-semibold tabular-nums text-muted-foreground/50 w-4 text-center">
          {index + 1}
        </span>
        <div
          className={cn(
            'flex items-center justify-center rounded-xl size-9',
            isCritical
              ? 'bg-destructive/15 text-destructive'
              : item.priority === 'high'
                ? 'bg-chart-4/15 text-chart-4'
                : item.priority === 'medium'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="text-sm font-semibold text-foreground leading-snug">
            {item.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {item.badge && (
              <Badge
                variant="outline"
                className={cn('text-[10px] h-5 px-1.5 rounded-full', config.badgeClass)}
              >
                {item.badge}
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn('text-[10px] h-5 px-1.5 rounded-full', config.badgeClass)}
            >
              {config.label}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {item.description}
        </p>
        {item.actionLabel && (
          <button
            onClick={onExpand}
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium transition-colors duration-150',
              isCritical
                ? 'text-destructive hover:text-destructive/80'
                : item.priority === 'high'
                  ? 'text-chart-4 hover:text-chart-4/80'
                  : 'text-primary hover:text-primary/80',
            )}
          >
            {item.actionLabel}
            <ArrowRight className="size-3" />
          </button>
        )}
      </div>

      {/* Critical pulse indicator */}
      {isCritical && (
        <span className="absolute top-4 right-4 flex size-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex rounded-full size-2 bg-destructive" />
        </span>
      )}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DailyBriefing({ userName, onExpand }: DailyBriefingProps) {
  const items = useMemo(() => getBriefingItems(), [])

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const criticalCount = items.filter(i => i.priority === 'critical').length
  const highCount = items.filter(i => i.priority === 'high').length
  const actionCount = criticalCount + highCount

  return (
    <div className="px-6 md:px-8 pt-8 pb-12">
      <div className="mx-auto max-w-2xl">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Sparkles className="size-4" />
            <span className="text-sm font-medium">{greeting}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            {userName}, here&apos;s what needs your attention.
          </h1>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span>{today}</span>
            </div>
            {actionCount > 0 && (
              <Badge className="text-xs rounded-full gap-1 bg-destructive text-destructive-foreground">
                <span className="size-1.5 rounded-full bg-destructive-foreground/70 inline-block" />
                {actionCount} {actionCount === 1 ? 'item' : 'items'} need action
              </Badge>
            )}
          </div>
        </div>

        {/* ── Briefing Items ── */}
        <div className="space-y-3 mb-8">
          {items.map((item, i) => (
            <BriefingCard
              key={item.id}
              item={item}
              index={i}
              onExpand={onExpand}
            />
          ))}
        </div>

        {/* ── Single CTA ── */}
        <div className="flex flex-col items-center gap-3 pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            {items.length} priority {items.length === 1 ? 'item' : 'items'} surfaced from your dashboard
          </p>
          <Button
            size="lg"
            className="rounded-2xl gap-2 px-8 w-full sm:w-auto"
            onClick={onExpand}
          >
            <LayoutDashboard className="size-4" />
            Open full dashboard
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
