'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Transaction, TransactionType, TransactionStatus } from '@/lib/types/admin'

interface EditTransactionDialogProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (t: Transaction) => void
  clientId: string
  clientName: string
}

type FormState = {
  type: TransactionType
  amount: string
  description: string
  date: string
  status: TransactionStatus
}

const EMPTY_FORM: FormState = {
  type: 'deposit',
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  status: 'pending',
}

const txTypeLabels: Record<TransactionType, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  buy: 'Buy',
  sell: 'Sell',
  fee: 'Fee',
  dividend: 'Dividend',
}

const txStatusLabels: Record<TransactionStatus, string> = {
  completed: 'Completed',
  pending: 'Pending',
  failed: 'Failed',
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onSave,
  clientId,
  clientName,
}: EditTransactionDialogProps) {
  const isNew = transaction === null
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    if (transaction) {
      setForm({
        type: transaction.type,
        amount: String(transaction.amount),
        description: transaction.description ?? '',
        date: transaction.date,
        status: transaction.status,
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [transaction, open])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const parsedAmount = parseFloat(form.amount)
  const isValid = form.amount.trim() !== '' && !isNaN(parsedAmount) && parsedAmount > 0

  const handleSubmit = () => {
    if (!isValid) return
    onSave({
      id: transaction?.id ?? `TXN${Date.now()}`,
      clientId,
      clientName,
      type: form.type,
      amount: parsedAmount,
      description: form.description.trim() || undefined,
      date: form.date,
      status: form.status,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add Transaction' : 'Edit Transaction'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => set('type', v as TransactionType)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(txTypeLabels) as TransactionType[]).map(k => (
                    <SelectItem key={k} value={k}>{txTypeLabels[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v as TransactionStatus)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(txStatusLabels) as TransactionStatus[]).map(k => (
                    <SelectItem key={k} value={k}>{txStatusLabels[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="et-amount">Amount ($) <span className="text-destructive">*</span></Label>
            <Input
              id="et-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              className="rounded-xl"
              placeholder="0.00"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="et-date">Date</Label>
            <Input
              id="et-date"
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="et-desc">Description</Label>
            <Input
              id="et-desc"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="rounded-xl"
              placeholder="Optional description"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="rounded-xl">
            {isNew ? 'Add Transaction' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
