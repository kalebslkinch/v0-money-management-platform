'use client'

import { TrendingUp, TrendingDown, Users, DollarSign, Percent, Wallet } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import type { KPIData } from '@/lib/types/admin'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  data: KPIData
}

export function StatsCards({ data }: StatsCardsProps) {
  const stats = [
    {
      title: 'Total AUM',
      value: formatCurrency(data.totalAUM, true),
      change: data.aumChange,
      icon: Wallet,
      color: 'from-primary to-chart-2',
      bgGlow: 'bg-primary/20',
    },
    {
      title: 'Active Clients',
      value: data.activeClients.toString(),
      change: data.clientsChange,
      icon: Users,
      color: 'from-chart-3 to-chart-5',
      bgGlow: 'bg-chart-3/20',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(data.monthlyRevenue, true),
      change: data.revenueChange,
      icon: DollarSign,
      color: 'from-chart-2 to-primary',
      bgGlow: 'bg-chart-2/20',
    },
    {
      title: 'Avg. Return',
      value: `${data.avgReturn}%`,
      change: data.returnChange,
      icon: Percent,
      color: 'from-chart-4 to-chart-3',
      bgGlow: 'bg-chart-4/20',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.title}
          className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Gradient background accent */}
          <div className={cn(
            "absolute -right-8 -top-8 size-24 rounded-full blur-2xl opacity-50 transition-opacity group-hover:opacity-70",
            stat.bgGlow
          )} />
          
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "flex size-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                stat.color
              )}>
                <stat.icon className="size-5 text-primary-foreground" />
              </div>
              
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                stat.change >= 0 
                  ? "bg-chart-2/10 text-chart-2" 
                  : "bg-destructive/10 text-destructive"
              )}>
                {stat.change >= 0 ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {formatPercentage(Math.abs(stat.change))}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <p className="text-3xl font-bold tracking-tight tabular-nums">{stat.value}</p>
            </div>
            
            {/* Mini sparkline visual */}
            <div className="mt-4 flex items-end gap-0.5 h-8">
              {[40, 65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-sm transition-all duration-300",
                    i === 7 ? "bg-primary" : "bg-muted-foreground/20 group-hover:bg-muted-foreground/30"
                  )}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
