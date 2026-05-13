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
import type { Advisor } from '@/lib/types/admin'

interface EditStaffDialogProps {
  advisor: Advisor | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (advisor: Advisor) => void
}

type FormState = Pick<Advisor, 'name' | 'email' | 'phone' | 'role' | 'status'>

const DEFAULT_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  role: 'advisor',
  status: 'active',
}

export function EditStaffDialog({ advisor, open, onOpenChange, onSave }: EditStaffDialogProps) {
  const isNew = advisor === null
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)

  useEffect(() => {
    if (!open) return
    if (advisor) {
      setForm({ name: advisor.name, email: advisor.email, phone: advisor.phone, role: advisor.role, status: advisor.status })
    } else {
      setForm(DEFAULT_FORM)
    }
  }, [advisor, open])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const isValid = form.name.trim().length > 0 && form.email.trim().length > 0

  const handleSubmit = () => {
    if (!isValid) return
    const today = new Date().toISOString().split('T')[0]
    onSave({
      id: advisor?.id ?? `ADV${Date.now()}`,
      clientIds: advisor?.clientIds ?? [],
      totalAUM: advisor?.totalAUM ?? 0,
      performance: advisor?.performance ?? { monthly: 0, quarterly: 0, yearly: 0 },
      activeCaseCount: advisor?.activeCaseCount ?? 0,
      joinDate: advisor?.joinDate ?? today,
      ...form,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add Staff Member' : 'Edit Staff Member'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="es-name">Full Name</Label>
            <Input id="es-name" value={form.name} onChange={e => set('name', e.target.value)} className="rounded-xl" placeholder="Jane Smith" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="es-email">Email</Label>
            <Input id="es-email" type="email" value={form.email} onChange={e => set('email', e.target.value)} className="rounded-xl" placeholder="jane.smith@alpha.com" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="es-phone">Phone</Label>
            <Input id="es-phone" value={form.phone} onChange={e => set('phone', e.target.value)} className="rounded-xl" placeholder="+1 (555) 000-0000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => set('role', v as Advisor['role'])}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="senior_advisor">Senior Advisor</SelectItem>
                  <SelectItem value="advisor">Advisor</SelectItem>
                  <SelectItem value="junior_advisor">Junior Advisor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v as Advisor['status'])}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="rounded-xl">
            {isNew ? 'Add Staff' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
