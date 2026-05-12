import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Landmark,
  CircleDollarSign,
  TrendingUp,
  Download,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockTransactions } from '@/lib/data/mock-transactions'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

const transactionIcons = {
  deposit: ArrowDownRight,
  withdrawal: ArrowUpRight,
  buy: Landmark,
  sell: CircleDollarSign,
  fee: ArrowLeftRight,
  dividend: TrendingUp,
}

const transactionColors = {
  deposit: 'text-success bg-success/10',
  withdrawal: 'text-destructive bg-destructive/10',
  buy: 'text-primary bg-primary/10',
  sell: 'text-warning bg-warning/10',
  fee: 'text-muted-foreground bg-muted',
  dividend: 'text-success bg-success/10',
}

const statusColors = {
  completed: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
}

export default function TransactionsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredTransactions = mockTransactions.filter((txn) => {
    const matchesSearch =
      txn.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (txn.asset?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (txn.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchesType = typeFilter === 'all' || txn.type === typeFilter
    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const totalDeposits = mockTransactions
    .filter(t => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawals = mockTransactions
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalFees = mockTransactions
    .filter(t => t.type === 'fee' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
  const pendingCount = mockTransactions.filter(t => t.status === 'pending').length

  return (
    <>
      <AdminHeader title="Transactions" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
              <p className="text-muted-foreground">
                View and manage all client transactions.
              </p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 size-4" />
              Export
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Deposits</p>
                <p className="text-2xl font-bold text-success tabular-nums">
                  +{formatCurrency(totalDeposits)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                <p className="text-2xl font-bold text-destructive tabular-nums">
                  -{formatCurrency(totalWithdrawals)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Fees Collected</p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrency(totalFees)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning tabular-nums">
                  {pendingCount} transactions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by client, asset, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="fee">Fee</SelectItem>
                  <SelectItem value="dividend">Dividend</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((txn) => {
                      const Icon = transactionIcons[txn.type]
                      return (
                        <TableRow key={txn.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                'flex size-8 items-center justify-center rounded-full',
                                transactionColors[txn.type]
                              )}>
                                <Icon className="size-4" />
                              </div>
                              <span className="font-medium capitalize">{txn.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/admin/clients/${txn.clientId}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {txn.clientName}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-[300px] truncate">
                            {txn.description || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDateTime(txn.date)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('capitalize', statusColors[txn.status])}>
                              {txn.status}
                            </Badge>
                          </TableCell>
                          <TableCell className={cn(
                            'text-right font-semibold tabular-nums',
                            txn.type === 'deposit' || txn.type === 'dividend' ? 'text-success' :
                            txn.type === 'withdrawal' || txn.type === 'fee' ? 'text-destructive' : ''
                          )}>
                            {txn.type === 'deposit' || txn.type === 'dividend' ? '+' : ''}
                            {txn.type === 'withdrawal' || txn.type === 'fee' ? '-' : ''}
                            {formatCurrency(txn.amount)}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            Showing {filteredTransactions.length} of {mockTransactions.length} transactions
          </p>
        </div>
      </main>
    </>
  )
}
