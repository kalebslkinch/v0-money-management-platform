'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Landmark,
  CircleDollarSign,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
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

const transactionStyles = {
  deposit: {
    icon: 'text-chart-2',
    bg: 'bg-chart-2/10',
    border: 'border-chart-2/20',
  },
  withdrawal: {
    icon: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
  },
  buy: {
    icon: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  sell: {
    icon: 'text-chart-4',
    bg: 'bg-chart-4/10',
    border: 'border-chart-4/20',
  },
  fee: {
    icon: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
  },
  dividend: {
    icon: 'text-chart-2',
    bg: 'bg-chart-2/10',
    border: 'border-chart-2/20',
  },
}

const statusStyles = {
  completed: 'bg-chart-2/10 text-chart-2',
  pending: 'bg-chart-4/10 text-chart-4',
  failed: 'bg-destructive/10 text-destructive',
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="col-span-1 lg:col-span-2 rounded-2xl bg-card border border-border/50">
      <div className="flex items-center justify-between p-6 pb-0">
        <div>
          <h3 className="text-lg font-semibold mb-1">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">Latest client activity</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          <Link href="/admin/transactions" className="flex items-center gap-1">
            View All
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      
      <div className="p-6 pt-4">
        <div className="space-y-2">
          {transactions.map((transaction) => {
            const Icon = transactionIcons[transaction.type]
            const styles = transactionStyles[transaction.type]
            
            return (
              <div
                key={transaction.id}
                className="group flex items-center gap-4 rounded-xl p-3 transition-all duration-200 hover:bg-accent/50 cursor-pointer"
              >
                <div
                  className={cn(
                    'flex size-11 items-center justify-center rounded-xl border',
                    styles.bg,
                    styles.border
                  )}
                >
                  <Icon className={cn('size-5', styles.icon)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{transaction.clientName}</p>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider',
                      statusStyles[transaction.status]
                    )}>
                      {transaction.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    {transaction.asset && ` · ${transaction.asset}`}
                  </p>
                </div>
                
                <div className="text-right">
                  <p
                    className={cn(
                      'font-semibold tabular-nums',
                      (transaction.type === 'deposit' || transaction.type === 'dividend')
                        ? 'text-chart-2'
                        : (transaction.type === 'withdrawal' || transaction.type === 'fee')
                        ? 'text-destructive'
                        : 'text-foreground'
                    )}
                  >
                    {(transaction.type === 'deposit' || transaction.type === 'dividend') ? '+' : ''}
                    {(transaction.type === 'withdrawal' || transaction.type === 'fee') ? '-' : ''}
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
      </div>
    </div>
  )
}
