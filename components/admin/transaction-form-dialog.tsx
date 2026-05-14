'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, X, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUserCategories, useUserTransactions } from '@/hooks/use-store'
import type { PaymentMethod, UserCategory, UserTransaction } from '@/lib/types/store'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'

interface TransactionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  /** When provided the dialog is in "edit" mode (SRD-U04). */
  editing?: UserTransaction | null
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'card', label: 'Card' },
  { value: 'bank-transfer', label: 'Bank transfer' },
  { value: 'direct-debit', label: 'Direct debit' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
]

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

interface CategoryOption {
  id: string
  label: string
  source: 'preset' | 'custom'
}

/**
 * Form to record a new transaction (SRD-U01) or edit an existing user
 * transaction (SRD-U04). Supports custom categories and tags (SRD-U02).
 */
export function TransactionFormDialog({
  open,
  onOpenChange,
  clientId,
  editing,
}: TransactionFormDialogProps) {
  const { create, update } = useUserTransactions(clientId)
  const { categories: customCategories, create: createCategory } = useUserCategories(clientId)

  const presetCategories = useMemo(() => {
    const snapshot = getPFMSSnapshotForCustomer(clientId)
    return snapshot.categories.map(category => ({
      id: category.id,
      label: category.label,
      source: 'preset' as const,
    }))
  }, [clientId])

  const allCategoryOptions: CategoryOption[] = useMemo(
    () => [
      ...presetCategories,
      ...customCategories.map(category => ({
        id: category.id,
        label: category.label,
        source: 'custom' as const,
      })),
    ],
    [presetCategories, customCategories],
  )

  const [date, setDate] = useState(todayIso())
  const [amount, setAmount] = useState('')
  const [merchant, setMerchant] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [categoryId, setCategoryId] = useState<string>(allCategoryOptions[0]?.id ?? '')
  const [tags, setTags] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState('')
  const [notes, setNotes] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')

  useEffect(() => {
    if (!open) return
    if (editing) {
      setDate(editing.date.slice(0, 10))
      setAmount(String(editing.amount))
      setMerchant(editing.merchant)
      setPaymentMethod(editing.paymentMethod)
      setCategoryId(editing.categoryId)
      setTags(editing.tags ?? [])
      setNotes(editing.notes ?? '')
    } else {
      setDate(todayIso())
      setAmount('')
      setMerchant('')
      setPaymentMethod('card')
      setCategoryId(allCategoryOptions[0]?.id ?? '')
      setTags([])
      setNotes('')
    }
    setTagDraft('')
    setNewCategoryName('')
  }, [open, editing, allCategoryOptions])

  function handleAddTag() {
    const trimmed = tagDraft.trim()
    if (!trimmed) return
    if (tags.includes(trimmed)) {
      setTagDraft('')
      return
    }
    setTags([...tags, trimmed])
    setTagDraft('')
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter(t => t !== tag))
  }

  function handleAddCategory() {
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    const created: UserCategory = createCategory({
      clientId,
      label: trimmed,
      essential: false,
    })
    setCategoryId(created.id)
    setNewCategoryName('')
  }

  function selectedCategoryLabel(): string {
    return allCategoryOptions.find(opt => opt.id === categoryId)?.label ?? 'Uncategorised'
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return
    if (!merchant.trim()) return
    if (!categoryId) return

    const isoDate = new Date(date).toISOString()
    const payload = {
      clientId,
      date: isoDate,
      amount: Number(numericAmount.toFixed(2)),
      merchant: merchant.trim(),
      paymentMethod,
      categoryId,
      categoryLabel: selectedCategoryLabel(),
      tags,
      notes: notes.trim() ? notes.trim() : undefined,
    }

    if (editing) {
      update(editing.id, payload)
    } else {
      create(payload)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit transaction' : 'Record a transaction'}</DialogTitle>
          <DialogDescription>
            Capture the date, amount, merchant, payment method, and category. You can add tags for
            quicker filtering later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="txn-date">Date</Label>
              <Input
                id="txn-date"
                type="date"
                value={date}
                onChange={event => setDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="txn-amount">Amount (GBP)</Label>
              <Input
                id="txn-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amount}
                onChange={event => setAmount(event.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="txn-merchant">Merchant</Label>
            <Input
              id="txn-merchant"
              value={merchant}
              onChange={event => setMerchant(event.target.value)}
              placeholder="e.g. Tesco Superstore"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Payment method</Label>
              <Select value={paymentMethod} onValueChange={value => setPaymentMethod(value as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {allCategoryOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                      {option.source === 'custom' && (
                        <span className="ml-1 text-[10px] text-muted-foreground">(custom)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Tag className="size-3" />
              Add a custom category
            </Label>
            <div className="flex gap-2">
              <Input
                value={newCategoryName}
                onChange={event => setNewCategoryName(event.target.value)}
                placeholder="e.g. Hobbies"
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleAddCategory()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Tag className="size-3" />
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                value={tagDraft}
                onChange={event => setTagDraft(event.target.value)}
                placeholder="e.g. weekly-shop"
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag} disabled={!tagDraft.trim()}>
                <Plus className="size-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className="hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="txn-notes">Notes (optional)</Label>
            <Textarea
              id="txn-notes"
              value={notes}
              onChange={event => setNotes(event.target.value)}
              placeholder="Anything else to remember about this transaction"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? 'Save changes' : 'Record transaction'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
