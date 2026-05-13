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
import { mockAdvisors } from '@/lib/data/mock-advisors'
import type { Client } from '@/lib/types/admin'

interface EditClientDialogProps {
  /** Pass an existing client to edit, or null to add a new one */
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (client: Client) => void
}

type FormState = Pick<Client, 'name' | 'email' | 'phone' | 'riskLevel' | 'status' | 'advisor' | 'advisorId'>

const DEFAULT_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  riskLevel: 'moderate',
  status: 'active',
  advisor: 'James Wilson',
  advisorId: 'ADV001',
}

const activeAdvisors = mockAdvisors.filter(a => a.status === 'active')

export function EditClientDialog({ client, open, onOpenChange, onSave }: EditClientDialogProps) {
  const isNew = client === null
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)

  useEffect(() => {
    if (!open) return
    if (client) {
      setForm({
        name: client.name,
        email: client.email,
        phone: client.phone,
        riskLevel: client.riskLevel,
        status: client.status,
        advisor: client.advisor,
        advisorId: client.advisorId,
      })
    } else {
      setForm(DEFAULT_FORM)
    }
  }, [client, open])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleAdvisorChange = (advisorId: string) => {
    const adv = mockAdvisors.find(a => a.id === advisorId)
    if (adv) {
      setForm(prev => ({ ...prev, advisorId, advisor: adv.name }))
    }
  }

  const isValid = form.name.trim().length > 0 && form.email.trim().length > 0

  const handleSubmit = () => {
    if (!isValid) return
    const today = new Date().toISOString().split('T')[0]
    onSave({
      id: client?.id ?? `CLT${Date.now()}`,
      portfolioValue: client?.portfolioValue ?? 0,
      joinedDate: client?.joinedDate ?? today,
      lastActivity: today,
      ...form,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add Client' : 'Edit Client'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="ec-name">Full Name</Label>
            <Input
              id="ec-name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Sarah Mitchell"
              className="rounded-xl"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="ec-email">Email</Label>
            <Input
              id="ec-email"
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="client@email.com"
              className="rounded-xl"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="ec-phone">Phone</Label>
            <Input
              id="ec-phone"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+1 (555) 000-0000"
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

          <div className="grid gap-1.5">
            <Label>Assigned Advisor</Label>
            <Select value={form.advisorId} onValueChange={handleAdvisorChange}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activeAdvisors.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="rounded-xl">
            {isNew ? 'Add Client' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
