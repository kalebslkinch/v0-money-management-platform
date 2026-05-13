'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addChangeRequest } from '@/lib/data/mock-change-requests'
import type { Client, ChangeRequestFieldChange } from '@/lib/types/admin'
import type { CurrentUser } from '@/lib/auth/user-context'

interface RequestChangeDialogProps {
  client: Client
  user: CurrentUser
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitted?: () => void
}

type FormState = Pick<Client, 'name' | 'email' | 'phone' | 'riskLevel' | 'status'>

const FIELD_LABELS: Record<keyof FormState, string> = {
  name: 'Full Name',
  email: 'Email',
  phone: 'Phone',
  riskLevel: 'Risk Level',
  status: 'Status',
}

export function RequestChangeDialog({ client, user, open, onOpenChange, onSubmitted }: RequestChangeDialogProps) {
  const [form, setForm] = useState<FormState>({
    name: client.name,
    email: client.email,
    phone: client.phone,
    riskLevel: client.riskLevel,
    status: client.status,
  })
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      riskLevel: client.riskLevel,
      status: client.status,
    })
    setNote('')
    setSubmitted(false)
  }, [client, open])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  // Compute which fields actually changed
  const changes: ChangeRequestFieldChange[] = (Object.keys(form) as (keyof FormState)[])
    .filter(key => String(form[key]) !== String(client[key]))
    .map(key => ({
      field: key,
      label: FIELD_LABELS[key],
      from: String(client[key]),
      to: String(form[key]),
    }))

  const canSubmit = changes.length > 0 && note.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    addChangeRequest({
      clientId: client.id,
      clientName: client.name,
      advisorId: user.advisorId ?? '',
      advisorName: user.name,
      note: note.trim(),
      changes,
    })
    setSubmitted(true)
    onSubmitted?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Request Change — {client.name}</DialogTitle>
          <DialogDescription>
            Propose an update to this client&apos;s record. Your manager will review and approve or reject the request.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-lg font-semibold">Request Submitted</p>
            <p className="text-sm text-muted-foreground">
              Your manager will review the {changes.length} change{changes.length !== 1 ? 's' : ''} you proposed.
            </p>
            <Button onClick={() => onOpenChange(false)} className="mt-4 rounded-xl">
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="rc-name">Full Name</Label>
                <Input
                  id="rc-name"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="rc-email">Email</Label>
                <Input
                  id="rc-email"
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="rc-phone">Phone</Label>
                <Input
                  id="rc-phone"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Risk Level</Label>
                  <Select value={form.riskLevel} onValueChange={v => set('riskLevel', v as Client['riskLevel'])}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => set('status', v as Client['status'])}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Show a diff summary when changes exist */}
              {changes.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Proposed changes</p>
                  {changes.map(c => (
                    <div key={c.field} className="flex items-center gap-2 text-xs">
                      <span className="font-medium">{c.label}:</span>
                      <span className="line-through text-muted-foreground">{c.from}</span>
                      <span>→</span>
                      <span className="font-medium text-foreground">{c.to}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-1.5">
                <Label htmlFor="rc-note">Reason / Note <span className="text-destructive">*</span></Label>
                <Textarea
                  id="rc-note"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Explain why this change is needed…"
                  className="rounded-xl resize-none"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit} className="rounded-xl">
                Submit Request
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
