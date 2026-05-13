'use client'

import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { useUserCategories, useUserTransactions } from '@/hooks/use-store'
import { TransactionFormDialog } from '@/components/admin/transaction-form-dialog'
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog'
import { exportData } from '@/lib/utils/export'
import { formatDate } from '@/lib/utils/format'
import type { UserTransaction } from '@/lib/types/store'

interface CustomerTransactionsPanelProps {
  clientId: string
}

/**
 * Customer-facing list of recorded transactions with create / edit / delete
 * (SRD-U01, U03, U04) and an export button (SRD-G06).
 */
export function CustomerTransactionsPanel({ clientId }: CustomerTransactionsPanelProps) {
  const { transactions, remove } = useUserTransactions(clientId)
  const { categories } = useUserCategories(clientId)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<UserTransaction | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const allCategories = useMemo(() => {
    const seen = new Map<string, string>()
    transactions.forEach(item => seen.set(item.categoryId, item.categoryLabel))
    categories.forEach(item => seen.set(item.id, item.label))
    return Array.from(seen.entries()).map(([id, label]) => ({ id, label }))
  }, [transactions, categories])

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return transactions.filter(item => {
      const matchesSearch =
        !term ||
        item.merchant.toLowerCase().includes(term) ||
        item.categoryLabel.toLowerCase().includes(term) ||
        item.tags.some(tag => tag.toLowerCase().includes(term))
      const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [transactions, search, categoryFilter])

  function handleEdit(item: UserTransaction) {
    setEditing(item)
    setDialogOpen(true)
  }

  function handleAdd() {
    setEditing(null)
    setDialogOpen(true)
  }

  function handleExport() {
    exportData({
      filename: `my-transactions-${new Date().toISOString().slice(0, 10)}`,
      rows: filtered,
      columns: [
        { key: 'date', label: 'Date', value: row => formatDate(row.date) },
        { key: 'merchant', label: 'Merchant' },
        { key: 'categoryLabel', label: 'Category' },
        { key: 'paymentMethod', label: 'Payment method' },
        { key: 'amount', label: 'Amount (GBP)' },
        { key: 'tags', label: 'Tags', value: row => row.tags.join(' | ') },
        { key: 'notes', label: 'Notes', value: row => row.notes ?? '' },
      ],
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <CardTitle>My Transactions</CardTitle>
          <CardDescription>
            Record what you spend, edit anything that needs correcting, and export anytime.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="mr-2 size-4" />
            Export
          </Button>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="mr-2 size-4" />
            Record Transaction
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search merchant, category, or tag"
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {allCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                    {transactions.length === 0
                      ? 'No transactions recorded yet. Use “Record Transaction” to add your first.'
                      : 'No transactions match your filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{formatDate(item.date)}</TableCell>
                    <TableCell className="font-medium">{item.merchant}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.categoryLabel}</Badge>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {item.paymentMethod.replace('-', ' ')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          item.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-destructive">
                      -GBP {item.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          aria-label={`Edit transaction at ${item.merchant}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setConfirmId(item.id)}
                          aria-label={`Delete transaction at ${item.merchant}`}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <TransactionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clientId={clientId}
        editing={editing}
      />

      <ConfirmDeleteDialog
        open={confirmId !== null}
        onOpenChange={open => !open && setConfirmId(null)}
        title="Delete this transaction?"
        description="The transaction will be permanently removed from your records."
        onConfirm={() => {
          if (confirmId) remove(confirmId)
          setConfirmId(null)
        }}
      />
    </Card>
  )
}
