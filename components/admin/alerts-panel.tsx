import Link from 'next/link'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Alert } from '@/lib/types/admin'
import { cn } from '@/lib/utils'

interface AlertsPanelProps {
  alerts: Alert[]
}

const alertIcons = {
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
}

const alertColors = {
  warning: 'border-l-warning bg-warning/5',
  danger: 'border-l-destructive bg-destructive/5',
  info: 'border-l-primary bg-primary/5',
}

const alertIconColors = {
  warning: 'text-warning',
  danger: 'text-destructive',
  info: 'text-primary',
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
        <CardDescription>Items requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = alertIcons[alert.type]
            return (
              <div
                key={alert.id}
                className={cn(
                  'rounded-lg border-l-4 p-3',
                  alertColors[alert.type]
                )}
              >
                <div className="flex items-start gap-2">
                  <Icon className={cn('size-4 mt-0.5 shrink-0', alertIconColors[alert.type])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {alert.message}
                    </p>
                    {alert.clientId && (
                      <Button variant="link" size="sm" className="h-auto p-0 mt-1" asChild>
                        <Link href={`/admin/clients/${alert.clientId}`}>
                          View Client
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
