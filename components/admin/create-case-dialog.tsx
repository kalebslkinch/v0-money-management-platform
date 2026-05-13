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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockClients } from '@/lib/data/mock-clients'
import { getAdvisorById } from '@/lib/data/mock-advisors'
import { addCase } from '@/lib/data/mock-cases'
import type { Case, CaseType, CasePriority } from '@/lib/types/admin'

interface CreateCaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (newCase: Case) => void
  /** If set, restrict case to a specific client */
  prefilledClientId?: string
  advisorId: string
  advisorName: string
  /** Optionally restrict client list to these ids */
  visibleClientIds?: string[]
}

const EMPTY_FORM = {
  title: '',
  type: 'general' as CaseType,
  priority: 'medium' as CasePriority,
  clientId: '',
  description: '',
  dueDate: '',
}

const caseTypeLabels: Record<CaseType, string> = {
  onboarding: 'Onboarding',
  annual_review: 'Annual Review',
  compliance: 'Compliance',
  complaint: 'Complaint',
  rebalance: 'Rebalance',
  kyc_update: 'KYC Update',
  general: 'General',
}

const casePriorityLabels: Record<CasePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export function CreateCaseDialog({
  open,
  onOpenChange,
  onCreated,
  prefilledClientId,
  advisorId,
  advisorName,
  visibleClientIds,
}: CreateCaseDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM)

  const visibleClients = visibleClientIds
    ? mockClients.filter(c => visibleClientIds.includes(c.id))
    : mockClients

  useEffect(() => {
    if (!open) return
    setForm({ ...EMPTY_FORM, clientId: prefilledClientId ?? '' })
  }, [open, prefilledClientId])

  const set = <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const isValid = form.title.trim() && form.clientId

  const handleSubmit = () => {
    if (!isValid) return
    const client = mockClients.find(c => c.id === form.clientId)
    const now = new Date().toISOString()
    const newCase: Case = {
      id: `CASE${Date.now()}`,
      clientId: form.clientId,
      clientName: client?.name ?? '',
      advisorId,
      advisorName,
      type: form.type,
      status: 'open',
      priority: form.priority,
      title: form.title.trim(),
      description: form.description.trim(),
      createdAt: now,
      updatedAt: now,
      dueDate: form.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      createdBy: advisorName,
      notes: [],
    }
    addCase(newCase)
    onCreated(newCase)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>New Case</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="cc-title">Title <span className="text-destructive">*</span></Label>
            <Input
              id="cc-title"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="rounded-xl"
              placeholder="Brief case title"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => set('type', v as CaseType)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(caseTypeLabels) as CaseType[]).map(k => (
                    <SelectItem key={k} value={k}>{caseTypeLabels[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => set('priority', v as CasePriority)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(casePriorityLabels) as CasePriority[]).map(k => (
                    <SelectItem key={k} value={k}>{casePriorityLabels[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Client <span className="text-destructive">*</span></Label>
            <Select
              value={form.clientId}
              onValueChange={v => set('clientId', v)}
              disabled={!!prefilledClientId}
            >
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>
                {visibleClients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="cc-due">Due Date</Label>
            <Input
              id="cc-due"
              type="date"
              value={form.dueDate}
              onChange={e => set('dueDate', e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="cc-desc">Description</Label>
            <Textarea
              id="cc-desc"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="rounded-xl resize-none"
              rows={3}
              placeholder="Optional additional details…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="rounded-xl">
            Create Case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
