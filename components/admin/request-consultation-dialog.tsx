'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { addCase } from '@/lib/data/mock-cases'
import type { Case } from '@/lib/types/admin'

interface RequestConsultationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  clientName: string
  advisorId: string
  advisorName: string
  onSubmitted?: (c: Case) => void
}

export function RequestConsultationDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
  advisorId,
  advisorName,
  onSubmitted,
}: RequestConsultationDialogProps) {
  const [topic, setTopic] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [message, setMessage] = useState('')

  const isValid = topic.trim().length > 0

  const handleSubmit = () => {
    if (!isValid) return
    const now = new Date().toISOString()
    const newCase: Case = {
      id: `CASE${Date.now()}`,
      clientId,
      clientName,
      advisorId,
      advisorName,
      type: 'general',
      status: 'open',
      priority: 'medium',
      title: `Consultation Request: ${topic.trim()}`,
      description: message.trim() + (preferredDate ? `\n\nPreferred date: ${preferredDate}` : ''),
      createdAt: now,
      updatedAt: now,
      dueDate: preferredDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdBy: clientName,
      notes: [],
    }
    addCase(newCase)
    onSubmitted?.(newCase)
    setTopic('')
    setPreferredDate('')
    setMessage('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Request Consultation</DialogTitle>
          <DialogDescription>
            Submit a consultation request to your advisor. They will follow up shortly.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="rc-topic">Topic <span className="text-destructive">*</span></Label>
            <Input
              id="rc-topic"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="rounded-xl"
              placeholder="e.g. Portfolio rebalancing, Tax planning…"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="rc-date">Preferred Date</Label>
            <Input
              id="rc-date"
              type="date"
              value={preferredDate}
              onChange={e => setPreferredDate(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="rc-msg">Message</Label>
            <Textarea
              id="rc-msg"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="rounded-xl resize-none"
              rows={3}
              placeholder="Additional context for your advisor…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="rounded-xl bg-primary hover:bg-primary/90">
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
