import { useState, useMemo } from 'react'
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
  Plus,
  Pencil,
  Trash2,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useUserRole } from '@/hooks/use-user-role'
import { PFMSCustomerSpending } from '@/components/admin/pfms-customer-spending'
import { EditTransactionDialog } from '@/components/admin/edit-transaction-dialog'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'
import { getVisibleTransactions } from '@/lib/utils/role-filters'
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/lib/data/mock-transactions'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/lib/types/admin'

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
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [localTxns, setLocalTxns] = useState<Transaction[]>(() => getVisibleTransactions(user))
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<Transaction | null>(null)

  const isCustomer = user.role === 'customer'

  const filteredTransactions = useMemo(() => {
    return localTxns.filter((txn) => {
      const matchesSearch =
        txn.clientName.toLowerCase().includes(search.toLowerCase()) ||
        (txn.asset?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (txn.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
      const matchesType = typeFilter === 'all' || txn.type === typeFilter
      const matchesStatus = statusFilter === 'all' || txn.status === statusFilter
      const matchesFrom = !dateFrom || txn.date >= dateFrom
      const matchesTo = !dateTo || txn.date <= dateTo + 'T23:59:59'
      return matchesSearch && matchesType && matchesStatus && matchesFrom && matchesTo
    })
  }, [localTxns, search, typeFilter, statusFilter, dateFrom, dateTo])

  const totalDeposits = localTxns
    .filter(t => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawals = localTxns
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalFees = localTxns
    .filter(t => t.type === 'fee' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
  const pendingCount = localTxns.filter(t => t.status === 'pending').length

  const handleSave = (saved: Transaction) => {
    const exists = localTxns.some(t => t.id === saved.id)
    if (exists) {
      updateTransaction(saved)
      setLocalTxns(prev => prev.map(t => t.id === saved.id ? saved : t))
    } else {
      addTransaction(saved)
      setLocalTxns(prev => [saved, ...prev])
    }
  }

  const confirmDelete = () => {
    if (!removeTarget) return
    deleteTransaction(removeTarget.id)
    setLocalTxns(prev => prev.filter(t => t.id !== removeTarget.id))
    setRemoveTarget(null)
  }

  if (user.role === 'customer') {
    const snapshot = getPFMSSnapshotForCustomer(user.clientId ?? 'CLT001')

    return (
      <>
        <AdminHeader title="Spending" />
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">My Transactions</h1>
                <p className="text-muted-foreground">Track your recent account activity.</p>
              </div>
              <Button
                className="rounded-xl bg-primary hover:bg-primary/90"
                onClick={() => { setEditingTxn(null); setEditDialogOpen(true) }}
              >
                <Plus className="mr-2 size-4" />
                Add Transaction
              </Button>
            </div>

            <PFMSCustomerSpending snapshot={snapshot} />

            {/* Customer transaction table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[80px]" />
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
                      filteredTransactions.map(txn => {
                        const Icon = transactionIcons[txn.type]
                        return (
                          <TableRow key={txn.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={cn('flex size-8 items-center justify-center rounded-full', transactionColors[txn.type])}>
                                  <Icon className="size-4" />
                                </div>
                                <span className="font-medium">{transactionLabels[txn.type]}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{txn.description || '-'}</TableCell>
                            <TableCell className="text-muted-foreground">{formatDateTime(txn.date)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn('capitalize', statusColors[txn.status])}>
                                {txn.status}
                              </Badge>
                            </TableCell>
                            <TableCell className={cn('text-right font-semibold tabular-nums',
                              txn.type === 'deposit' || txn.type === 'dividend' ? 'text-success' :
                              txn.type === 'withdrawal' || txn.type === 'fee' ? 'text-destructive' : ''
                            )}>
                              {txn.type === 'deposit' || txn.type === 'dividend' ? '+' : ''}
                              {txn.type === 'withdrawal' || txn.type === 'fee' ? '-' : ''}
                              {formatCurrency(txn.amount)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-lg"
                                  onClick={() => { setEditingTxn(txn); setEditDialogOpen(true) }}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
                                  onClick={() => setRemoveTarget(txn)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>

        <EditTransactionDialog
          transaction={editingTxn}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSave}
          clientId={user.clientId ?? 'CLT001'}
          clientName={user.name}
        />

        <AlertDialog open={removeTarget !== null} onOpenChange={open => { if (!open) setRemoveTarget(null) }}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
              <AlertDialogDescription>
                This transaction will be permanently deleted and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={confirmDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
                  : 'View spending activity for your assigned customers.'}
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
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by customer or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
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
            <Input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-[160px]"
              title="From date"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-[160px]"
              title="To date"
            />
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
            Showing {filteredTransactions.length} of {localTxns.length} transactions
          </p>
        </div>
      </main>
    </>
  )
}
