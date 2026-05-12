import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency, formatPercentage, getInitials } from '@/lib/utils/format'
import type { Client } from '@/lib/types/admin'

interface TopClientsProps {
  clients: (Client & { ytdReturn: number })[]
}

export function TopClients({ clients }: TopClientsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Clients</CardTitle>
        <CardDescription>By portfolio value</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clients.map((client, index) => (
            <Link
              key={client.id}
              href={`/admin/clients/${client.id}`}
              className="flex items-center gap-3 group"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {index + 1}
              </div>
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(client.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                  {client.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(client.portfolioValue, true)}
                </p>
              </div>
              <div className="flex items-center gap-1 text-success text-xs font-medium">
                <TrendingUp className="size-3" />
                {formatPercentage(client.ytdReturn)}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
