import Link from 'next/link'
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Landmark,
  CircleDollarSign,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import type { Transaction } from '@/lib/types/admin'
import { cn } from '@/lib/utils'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

const transactionIcons = {
  deposit: ArrowDownRight,
  withdrawal: ArrowUpRight,
  buy: Landmark,
  sell: CircleDollarSign,
  fee: ArrowLeftRight,
  dividend: TrendingUp,
}

const transactionColors = {
  deposit: 'text-success',
  withdrawal: 'text-destructive',
  buy: 'text-primary',
  sell: 'text-warning',
  fee: 'text-muted-foreground',
  dividend: 'text-success',
}

const statusColors = {
  completed: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest client activity</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/transactions">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const Icon = transactionIcons[transaction.type]
            return (
              <div
                key={transaction.id}
                className="flex items-center gap-4 rounded-lg border p-3"
              >
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full bg-muted',
                    transactionColors[transaction.type]
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{transaction.clientName}</p>
                    <Badge variant="outline" className={cn('text-xs', statusColors[transaction.status])}>
                      {transaction.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    {transaction.asset && ` - ${transaction.asset}`}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      'font-semibold tabular-nums',
                      transaction.type === 'deposit' || transaction.type === 'dividend'
                        ? 'text-success'
                        : transaction.type === 'withdrawal' || transaction.type === 'fee'
                        ? 'text-destructive'
                        : ''
                    )}
                  >
                    {transaction.type === 'deposit' || transaction.type === 'dividend' ? '+' : ''}
                    {transaction.type === 'withdrawal' || transaction.type === 'fee' ? '-' : ''}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(transaction.date)}
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
