import { UserPlus, ArrowLeftRight, AlertTriangle, Calendar, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

const activityColors = {
  client_added: 'bg-success/10 text-success',
  transaction: 'bg-primary/10 text-primary',
  alert: 'bg-warning/10 text-warning',
  meeting: 'bg-chart-3/10 text-chart-3',
  document: 'bg-muted text-muted-foreground',
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>What&apos;s happening in your accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type]
            return (
              <div key={activity.id} className="flex gap-3">
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full',
                    activityColors[activity.type]
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
