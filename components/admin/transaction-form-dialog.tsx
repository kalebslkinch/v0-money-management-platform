'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, X, Tag, Receipt, Sparkles, Split, Upload, Trash2 } from 'lucide-react'
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
import type {
  PaymentMethod,
  ReceiptAttachment,
  TransactionSplit,
  UserCategory,
  UserTransaction,
} from '@/lib/types/store'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'
import { scanReceipt } from '@/lib/services/receipt-scanner'

interface TransactionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  /** When provided the dialog is in "edit" mode (SRD-U04). */
  editing?: UserTransaction | null
  /**
   * Optional pre-fill values supplied by the receipt scanner (SRD-U16/A12).
   * The dialog shows a "Auto-recognised from receipt" banner when present.
   */
  prefill?: {
    merchant?: string
    amount?: number
    date?: string
    paymentMethod?: PaymentMethod
    suggestedCategory?: string
    receipt?: ReceiptAttachment
    confidence?: number
    fromReceiptScan?: boolean
  } | null
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
 * transaction (SRD-U04). Supports custom categories and tags (SRD-U02),
 * receipt attachments (SRD-U15), AI receipt scanner pre-fill (SRD-U16/A12),
 * and split allocations (SRD-U10).
 */
export function TransactionFormDialog({
  open,
  onOpenChange,
  clientId,
  editing,
  prefill,
}: TransactionFormDialogProps) {
  const { create, update } = useUserTransactions(clientId)
  const { categories: customCategories, create: createCategory } = useUserCategories(clientId)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
  const [receipt, setReceipt] = useState<ReceiptAttachment | null>(null)
  const [splits, setSplits] = useState<TransactionSplit[]>([])
  const [splitMode, setSplitMode] = useState(false)
  const [scanInfo, setScanInfo] = useState<{ confidence: number } | null>(null)
  const [scanning, setScanning] = useState(false)
  const [fromReceiptScan, setFromReceiptScan] = useState(false)

  function findCategoryByLabel(label: string): string | null {
    const normalized = label.trim().toLowerCase()
    const match = allCategoryOptions.find(opt => opt.label.toLowerCase() === normalized)
    return match?.id ?? null
  }

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
      setReceipt(editing.receipt ?? null)
      setSplits(editing.splits ?? [])
      setSplitMode((editing.splits ?? []).length > 0)
      setScanInfo(null)
      setFromReceiptScan(Boolean(editing.fromReceiptScan))
    } else {
      setDate(prefill?.date ?? todayIso())
      setAmount(prefill?.amount !== undefined ? String(prefill.amount) : '')
      setMerchant(prefill?.merchant ?? '')
      setPaymentMethod(prefill?.paymentMethod ?? 'card')
      const prefillCategoryId = prefill?.suggestedCategory
        ? findCategoryByLabel(prefill.suggestedCategory)
        : null
      setCategoryId(prefillCategoryId ?? allCategoryOptions[0]?.id ?? '')
      setTags([])
      setNotes('')
      setReceipt(prefill?.receipt ?? null)
      setSplits([])
      setSplitMode(false)
      setScanInfo(prefill?.confidence !== undefined ? { confidence: prefill.confidence } : null)
      setFromReceiptScan(Boolean(prefill?.fromReceiptScan))
    }
    setTagDraft('')
    setNewCategoryName('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, prefill, allCategoryOptions.length])

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

    let activeSplits: TransactionSplit[] | undefined
    if (splitMode && splits.length > 0) {
      const total = splits.reduce((sum, s) => sum + s.amount, 0)
      // Only persist splits that sum (within 1 pence) to the transaction total
      if (Math.abs(total - numericAmount) > 0.01) return
      activeSplits = splits.map(s => ({ ...s, amount: Number(s.amount.toFixed(2)) }))
    }

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
      receipt: receipt ?? undefined,
      splits: activeSplits,
      fromReceiptScan: fromReceiptScan || undefined,
    }

    if (editing) {
      update(editing.id, payload)
    } else {
      create(payload)
    }
    onOpenChange(false)
  }

  // ── Receipt / scan handlers ──────────────────────────────────────────────────

  async function handleReceiptFile(file: File, useScanner: boolean) {
    if (!file.type.startsWith('image/')) {
      // Still allow attaching as a generic receipt without OCR
    }
    if (useScanner) {
      setScanning(true)
      try {
        const result = await scanReceipt(file)
        setReceipt({
          dataUrl: result.dataUrl,
          filename: result.filename,
          mimeType: result.mimeType,
          size: result.size,
          uploadedAt: new Date().toISOString(),
        })
        setMerchant(result.extracted.merchant)
        setAmount(String(result.extracted.amount))
        setDate(result.extracted.date)
        setPaymentMethod(result.extracted.paymentMethod)
        const matchedCategoryId = findCategoryByLabel(result.extracted.suggestedCategory)
        if (matchedCategoryId) setCategoryId(matchedCategoryId)
        setScanInfo({ confidence: result.extracted.confidence })
        setFromReceiptScan(true)
      } finally {
        setScanning(false)
      }
    } else {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : ''
        if (!dataUrl) return
        setReceipt({
          dataUrl,
          filename: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          uploadedAt: new Date().toISOString(),
        })
      }
      reader.readAsDataURL(file)
    }
  }

  function handleAttachReceipt() {
    fileInputRef.current?.removeAttribute('data-scan')
    fileInputRef.current?.click()
  }

  function handleScanReceipt() {
    if (!fileInputRef.current) return
    fileInputRef.current.setAttribute('data-scan', 'true')
    fileInputRef.current.click()
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    const useScanner = event.target.getAttribute('data-scan') === 'true'
    event.target.value = ''
    event.target.removeAttribute('data-scan')
    if (file) {
      handleReceiptFile(file, useScanner)
    }
  }

  function removeReceipt() {
    setReceipt(null)
    setFromReceiptScan(false)
    setScanInfo(null)
  }

  // ── Split handlers ───────────────────────────────────────────────────────────

  function addSplit() {
    const numericAmount = Number(amount) || 0
    const usedSoFar = splits.reduce((sum, s) => sum + s.amount, 0)
    const remainder = Math.max(0, Number((numericAmount - usedSoFar).toFixed(2)))
    const fallback = allCategoryOptions[0]
    if (!fallback) return
    setSplits([
      ...splits,
      {
        id: `split-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        categoryId: fallback.id,
        categoryLabel: fallback.label,
        amount: remainder,
      },
    ])
  }

  function updateSplit(id: string, patch: Partial<TransactionSplit>) {
    setSplits(splits.map(s => {
      if (s.id !== id) return s
      const next = { ...s, ...patch }
      if (patch.categoryId) {
        const opt = allCategoryOptions.find(o => o.id === patch.categoryId)
        if (opt) next.categoryLabel = opt.label
      }
      return next
    }))
  }

  function removeSplit(id: string) {
    setSplits(splits.filter(s => s.id !== id))
  }

  const splitTotal = splits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
  const numericAmount = Number(amount) || 0
  const splitDelta = Number((numericAmount - splitTotal).toFixed(2))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit transaction' : 'Record a transaction'}</DialogTitle>
          <DialogDescription>
            Capture the date, amount, merchant, payment method, and category. You can add tags,
            attach a receipt, or split a single charge across multiple categories.
          </DialogDescription>
        </DialogHeader>

        {scanInfo && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs flex items-start gap-2">
            <Sparkles className="size-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Auto-recognised from receipt</p>
              <p className="text-muted-foreground">
                Confidence {(scanInfo.confidence * 100).toFixed(0)}%. Please review the fields below
                before saving.
              </p>
            </div>
          </div>
        )}

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
            <Label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Receipt className="size-3" />
              Receipt
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileSelected}
            />
            {receipt ? (
              <div className="flex items-center gap-3 rounded-lg border p-2">
                {receipt.mimeType.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={receipt.dataUrl}
                    alt={receipt.filename}
                    className="size-12 rounded object-cover border"
                  />
                ) : (
                  <div className="size-12 rounded border flex items-center justify-center bg-muted">
                    <Receipt className="size-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0 text-xs">
                  <p className="truncate font-medium">{receipt.filename}</p>
                  <p className="text-muted-foreground">
                    {(receipt.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeReceipt}
                  aria-label="Remove receipt"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAttachReceipt}
                  className="flex-1"
                >
                  <Upload className="mr-2 size-3.5" />
                  Attach receipt
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleScanReceipt}
                  disabled={scanning}
                  className="flex-1"
                >
                  <Sparkles className="mr-2 size-3.5" />
                  {scanning ? 'Scanning…' : 'Scan with AI'}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Split className="size-3" />
                Split across categories
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const next = !splitMode
                  setSplitMode(next)
                  if (next && splits.length === 0) addSplit()
                  if (!next) setSplits([])
                }}
                className="h-7 text-xs"
              >
                {splitMode ? 'Disable splits' : 'Enable splits'}
              </Button>
            </div>
            {splitMode && (
              <div className="space-y-2 rounded-lg border p-2">
                {splits.map(split => (
                  <div key={split.id} className="flex gap-2 items-center">
                    <Select
                      value={split.categoryId}
                      onValueChange={value => updateSplit(split.id, { categoryId: value })}
                    >
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategoryOptions.map(option => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={split.amount}
                      onChange={event =>
                        updateSplit(split.id, {
                          amount: Number(event.target.value) || 0,
                        })
                      }
                      className="h-8 w-24 text-xs text-right"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSplit(split.id)}
                      aria-label="Remove split"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSplit}
                    className="h-7 text-xs"
                  >
                    <Plus className="mr-1 size-3" /> Add split
                  </Button>
                  <p
                    className={`text-xs tabular-nums ${
                      Math.abs(splitDelta) <= 0.01
                        ? 'text-success'
                        : 'text-destructive'
                    }`}
                  >
                    {Math.abs(splitDelta) <= 0.01
                      ? 'Splits balance.'
                      : `Remaining GBP ${splitDelta.toFixed(2)}`}
                  </p>
                </div>
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
