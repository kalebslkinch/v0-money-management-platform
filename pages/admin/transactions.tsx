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
import { useUserRole } from '@/hooks/use-user-role'
import { PFMSCustomerSpending } from '@/components/admin/pfms-customer-spending'
import { CustomerTransactionsPanel } from '@/components/admin/customer-transactions-panel'
import { PrivacyNotice } from '@/components/admin/privacy-notice'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'
import { getVisibleTransactions } from '@/lib/utils/role-filters'
import { mockClients } from '@/lib/data/mock-clients'
import { mockAdvisors } from '@/lib/data/mock-advisors'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import { exportData } from '@/lib/utils/export'
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

const transactionLabels = {
  deposit: 'Income In',
  withdrawal: 'Bill Payment',
  buy: 'Card Spend',
  sell: 'Refund',
  fee: 'Bank Fee',
  dividend: 'Cashback',
}

export default function TransactionsPage() {
  const { user } = useUserRole()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [advisorFilter, setAdvisorFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const visibleTransactions = getVisibleTransactions(user)

  const filteredTransactions = visibleTransactions.filter((txn) => {
    const matchesSearch =
      txn.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (txn.asset?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (txn.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchesType = typeFilter === 'all' || txn.type === typeFilter
    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter
    const client = mockClients.find(c => c.id === txn.clientId)
    const matchesAdvisor = advisorFilter === 'all' || client?.advisorId === advisorFilter
    const matchesRisk = riskFilter === 'all' || client?.riskLevel === riskFilter
    const txnTime = new Date(txn.date).getTime()
    const fromTime = fromDate ? new Date(fromDate).getTime() : -Infinity
    const toTime = toDate ? new Date(toDate).getTime() + 86_400_000 : Infinity
    const matchesDate = txnTime >= fromTime && txnTime <= toTime
    return matchesSearch && matchesType && matchesStatus && matchesAdvisor && matchesRisk && matchesDate
  })

  const totalDeposits = visibleTransactions
    .filter(t => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawals = visibleTransactions
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalFees = visibleTransactions
    .filter(t => t.type === 'fee' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
  const pendingCount = visibleTransactions.filter(t => t.status === 'pending').length

  if (user.role === 'customer') {
    const snapshot = getPFMSSnapshotForCustomer(user.clientId ?? 'CLT001')

    return (
      <>
        <AdminHeader title="Spending" />
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <PrivacyNotice />
            <CustomerTransactionsPanel clientId={user.clientId ?? 'CLT001'} />
            <PFMSCustomerSpending snapshot={snapshot} />
          </div>
        </main>
      </>
    )
  }

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
                {user.role === 'manager'
                  ? 'View and monitor all customer spending activity.'
                  : user.role === 'fa'
                    ? 'View spending activity for your assigned customers.'
                    : 'Track your recent account activity.'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                exportData({
                  filename: `transactions-${new Date().toISOString().slice(0, 10)}`,
                  rows: filteredTransactions,
                  columns: [
                    { key: 'date', label: 'Date', value: row => formatDateTime(row.date) },
                    { key: 'clientName', label: 'Customer' },
                    { key: 'type', label: 'Type', value: row => transactionLabels[row.type] },
                    { key: 'description', label: 'Description', value: row => row.description ?? '' },
                    { key: 'amount', label: 'Amount' },
                    { key: 'status', label: 'Status' },
                  ],
                })
              }
              disabled={filteredTransactions.length === 0}
            >
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
                <p className="text-sm text-muted-foreground">Bank Fees</p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrency(totalFees)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning tabular-nums">
                  {pendingCount} items
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by customer or description..."
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
                  <SelectItem value="deposit">Income In</SelectItem>
                  <SelectItem value="withdrawal">Bill Payment</SelectItem>
                  <SelectItem value="buy">Card Spend</SelectItem>
                  <SelectItem value="sell">Refund</SelectItem>
                  <SelectItem value="fee">Bank Fee</SelectItem>
                  <SelectItem value="dividend">Cashback</SelectItem>
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
              {user.role === 'manager' && (
                <Select value={advisorFilter} onValueChange={setAdvisorFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Adviser" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Advisers</SelectItem>
                    {mockAdvisors.map(advisor => (
                      <SelectItem key={advisor.id} value={advisor.id}>
                        {advisor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Client risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={fromDate}
                onChange={event => setFromDate(event.target.value)}
                className="w-[150px]"
                aria-label="From date"
              />
              <Input
                type="date"
                value={toDate}
                onChange={event => setToDate(event.target.value)}
                className="w-[150px]"
                aria-label="To date"
              />
            </div>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Customer</TableHead>
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
                              <span className="font-medium">{transactionLabels[txn.type]}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.role === 'customer' ? (
                              <span className="font-medium">{txn.clientName}</span>
                            ) : (
                              <Link
                                href={`/admin/clients/${txn.clientId}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {txn.clientName}
                              </Link>
                            )}
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
            Showing {filteredTransactions.length} of {visibleTransactions.length} transactions
          </p>
        </div>
      </main>
    </>
  )
}
