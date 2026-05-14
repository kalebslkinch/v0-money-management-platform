'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency, getInitials } from '@/lib/utils/format'
import type { Client } from '@/lib/types/admin'

interface TopClientsProps {
  clients: (Client & { budgetVariance: number })[]
}

const rankColors = [
  'from-chart-4 to-chart-4/50', // Gold
  'from-muted-foreground to-muted-foreground/50', // Silver
  'from-chart-4/60 to-chart-4/30', // Bronze
]

export function TopClients({ clients }: TopClientsProps) {
  return (
    <div className="rounded-2xl bg-card border border-border/50">
      <div className="p-6 pb-0">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="size-5 text-warning" />
          <h3 className="text-lg font-semibold">Needs Attention</h3>
        </div>
        <p className="text-sm text-muted-foreground">Clients most over or near budget</p>
      </div>
      
      <div className="p-6 pt-4">
        <div className="space-y-3">
          {clients.map((client, index) => (
            <Link
              key={client.id}
              href={`/admin/clients/${client.id}`}
              className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-accent/50"
            >
              <div className={`
                flex size-8 items-center justify-center rounded-lg text-sm font-bold
                ${index < 3 
                  ? `bg-gradient-to-br ${rankColors[index]} text-primary-foreground` 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {index + 1}
              </div>
              
              <Avatar className="size-10 ring-2 ring-border">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-chart-2/20 text-primary text-xs font-semibold">
                  {getInitials(client.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                  {client.name}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {formatCurrency(client.monthlyBudget, true)}/mo
                </p>
              </div>
              
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                client.budgetVariance < 0
                  ? 'bg-destructive/10 text-destructive'
                  : client.budgetVariance < 5
                  ? 'bg-chart-4/10 text-chart-4'
                  : 'bg-chart-2/10 text-chart-2'
              }`}>
                {client.budgetVariance < 0 ? (
                  <TrendingDown className="size-3" />
                ) : (
                  <TrendingUp className="size-3" />
                )}
                {client.budgetVariance > 0 ? '+' : ''}{client.budgetVariance}%
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
