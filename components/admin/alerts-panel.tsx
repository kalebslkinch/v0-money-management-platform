'use client'

import Link from 'next/link'
import { AlertTriangle, AlertCircle, Info, Shield, ArrowRight } from 'lucide-react'
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

const alertStyles = {
  warning: {
    bg: 'bg-chart-4/10',
    border: 'border-chart-4/30',
    icon: 'text-chart-4',
    badge: 'bg-chart-4 text-primary-foreground',
  },
  danger: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    icon: 'text-destructive',
    badge: 'bg-destructive text-destructive-foreground',
  },
  info: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    icon: 'text-primary',
    badge: 'bg-primary text-primary-foreground',
  },
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const criticalCount = alerts.filter(a => a.type === 'danger').length
  
  return (
    <div className="rounded-2xl bg-card border border-border/50">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-destructive" />
            <h3 className="text-lg font-semibold">Alerts</h3>
          </div>
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
              {criticalCount} Critical
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Requires your attention</p>
      </div>
      
      <div className="p-6 pt-4">
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = alertIcons[alert.type]
            const styles = alertStyles[alert.type]
            
            return (
              <div
                key={alert.id}
                className={cn(
                  'group rounded-xl border p-3 transition-all duration-200 hover:shadow-md cursor-pointer',
                  styles.bg,
                  styles.border
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                    styles.bg
                  )}>
                    <Icon className={cn('size-4', styles.icon)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{alert.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {alert.message}
                    </p>
                    
                    {alert.clientId && (
                      <Link 
                        href={`/admin/clients/${alert.clientId}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                      >
                        View Client
                        <ArrowRight className="size-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
