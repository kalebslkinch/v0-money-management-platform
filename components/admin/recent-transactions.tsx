'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Landmark,
  CircleDollarSign,
  RefreshCw,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import type { Transaction, TransactionType } from '@/lib/types/admin'
import { cn } from '@/lib/utils'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

const transactionIcons: Record<TransactionType, React.ComponentType<{ className?: string }>> = {
  income:     CircleDollarSign,
  expense:    ArrowUpRight,
  deposit:    ArrowDownRight,
  withdrawal: ArrowUpRight,
  transfer:   ArrowLeftRight,
  fee:        Landmark,
}

const transactionStyles: Record<TransactionType, { icon: string; bg: string; border: string }> = {
  income: {
    icon: 'text-chart-2',
    bg: 'bg-chart-2/10',
    border: 'border-chart-2/20',
  },
  expense: {
    icon: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
  },
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
  transfer: {
    icon: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  fee: {
    icon: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
  },
}

const statusStyles = {
  completed: 'bg-chart-2/10 text-chart-2',
  pending: 'bg-chart-4/10 text-chart-4',
  failed: 'bg-destructive/10 text-destructive',
}

const transactionTypeLabels: Record<TransactionType, string> = {
  income:     'Income',
  expense:    'Expense',
  deposit:    'Deposit',
  withdrawal: 'Withdrawal',
  transfer:   'Transfer',
  fee:        'Bank Fee',
}

const positiveAmountTypes = new Set<Transaction['type']>(['income', 'deposit'])

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="col-span-1 lg:col-span-2 rounded-2xl bg-card border border-border/50">
      <div className="flex items-center justify-between p-6 pb-0">
        <div>
          <h3 className="text-lg font-semibold mb-1">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">Latest spending and cash activity</p>
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
                    {transactionTypeLabels[transaction.type]}
                  </p>
                </div>
                
                <div className="text-right">
                  <p
                    className={cn(
                      'font-semibold tabular-nums',
                      positiveAmountTypes.has(transaction.type)
                        ? 'text-chart-2'
                        : !positiveAmountTypes.has(transaction.type)
                        ? 'text-destructive'
                        : 'text-foreground'
                    )}
                  >
                    {positiveAmountTypes.has(transaction.type) ? '+' : '-'}
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
