'use client'

import { UserPlus, ArrowLeftRight, AlertTriangle, Calendar, FileText, Clock } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import type { Activity } from '@/lib/types/admin'
import { cn } from '@/lib/utils'

interface ActivityFeedProps {
  activities: Activity[]
}

const activityIcons = {
  client_added: UserPlus,
  transaction: ArrowLeftRight,
  alert: AlertTriangle,
  meeting: Calendar,
  document: FileText,
}

const activityStyles = {
  client_added: {
    bg: 'bg-chart-2/10',
    border: 'border-chart-2/30',
    icon: 'text-chart-2',
    line: 'bg-chart-2/30',
  },
  transaction: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    icon: 'text-primary',
    line: 'bg-primary/30',
  },
  alert: {
    bg: 'bg-chart-4/10',
    border: 'border-chart-4/30',
    icon: 'text-chart-4',
    line: 'bg-chart-4/30',
  },
  meeting: {
    bg: 'bg-chart-3/10',
    border: 'border-chart-3/30',
    icon: 'text-chart-3',
    line: 'bg-chart-3/30',
  },
  document: {
    bg: 'bg-muted',
    border: 'border-border',
    icon: 'text-muted-foreground',
    line: 'bg-border',
  },
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl bg-card border border-border/50">
      <div className="p-6 pb-0">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="size-5 text-primary" />
          <h3 className="text-lg font-semibold">Activity</h3>
        </div>
        <p className="text-sm text-muted-foreground">Recent account activity</p>
      </div>
      
      <div className="p-6 pt-4">
        <div className="relative space-y-0">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type]
            const styles = activityStyles[activity.type]
            const isLast = index === activities.length - 1
            
            return (
              <div key={activity.id} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Timeline line */}
                {!isLast && (
                  <div className={cn(
                    "absolute left-4 top-10 -bottom-2 w-px",
                    styles.line
                  )} />
                )}
                
                {/* Icon */}
                <div
                  className={cn(
                    'relative flex size-8 shrink-0 items-center justify-center rounded-full border z-10',
                    styles.bg,
                    styles.border
                  )}
                >
                  <Icon className={cn('size-4', styles.icon)} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-medium leading-tight">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {activity.description}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1.5 font-mono">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
