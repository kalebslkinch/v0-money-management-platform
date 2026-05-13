'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PFMSCustomerSnapshot } from '@/lib/types/pfms'

interface PFMSCustomerSpendingProps {
  snapshot: PFMSCustomerSnapshot
}

export function PFMSCustomerSpending({ snapshot }: PFMSCustomerSpendingProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | string>('all')

  const filteredTransactions = useMemo(() => {
    return snapshot.recentTransactions.filter(transaction => {
      const matchesSearch = transaction.merchant.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'all' || transaction.categoryId === category
      return matchesSearch && matchesCategory
    })
  }, [snapshot.recentTransactions, search, category])

  const categoryTotals = useMemo(() => {
    return snapshot.recentTransactions.reduce<Record<string, number>>((acc, transaction) => {
      acc[transaction.categoryLabel] = (acc[transaction.categoryLabel] ?? 0) + transaction.amount
      return acc
    }, {})
  }, [snapshot.recentTransactions])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Spending</h1>
        <p className="text-muted-foreground">Track everyday transactions and category patterns.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(categoryTotals).map(([label, total]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">GBP {total.toFixed(2)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Spending</CardTitle>
          <CardDescription>
            Use category filtering to monitor Tesco and food delivery trends quickly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search merchant..."
                className="pl-9"
              />
            </div>
            <select
              value={category}
              onChange={event => setCategory(event.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">All categories</option>
              {snapshot.categories.map(categoryItem => (
                <option key={categoryItem.id} value={categoryItem.id}>
                  {categoryItem.label}
                </option>
              ))}
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                    No transactions found for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.merchant}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{transaction.categoryLabel}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">{transaction.channel.replace('-', ' ')}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-destructive">
                      -GBP {transaction.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
