import { TrendingUp, TrendingDown, Users, DollarSign, Percent, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      description: 'Assets under management',
    },
    {
      title: 'Active Clients',
      value: data.activeClients.toString(),
      change: data.clientsChange,
      icon: Users,
      description: 'Currently active',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(data.monthlyRevenue, true),
      change: data.revenueChange,
      icon: DollarSign,
      description: 'This month',
    },
    {
      title: 'Avg. Return',
      value: `${data.avgReturn}%`,
      change: data.returnChange,
      icon: Percent,
      description: 'Portfolio performance',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
            <div className="flex items-center gap-1 text-xs">
              <span
                className={cn(
                  'flex items-center gap-0.5 font-medium',
                  stat.change >= 0 ? 'text-success' : 'text-destructive'
                )}
              >
                {stat.change >= 0 ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {formatPercentage(stat.change)}
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
