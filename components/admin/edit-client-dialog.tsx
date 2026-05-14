'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useClientOverrides, type ClientOverride } from '@/hooks/use-client-overrides'
import type { Client } from '@/lib/types/admin'

interface EditClientDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Edit dialog — lets advisers and managers update client profile details.
 * Persists overrides locally; safe to wire to a real API later.
 */
export function EditClientDialog({ client, open, onOpenChange }: EditClientDialogProps) {
  const { update } = useClientOverrides()
  const [form, setForm] = useState<ClientOverride>({
    name: client.name,
    email: client.email,
    phone: client.phone,
    budgetHealth: client.budgetHealth,
    status: client.status,
  })

  useEffect(() => {
    if (open) {
      setForm({
        name: client.name,
        email: client.email,
        phone: client.phone,
        budgetHealth: client.budgetHealth,
        status: client.status,
      })
    }
  }, [open, client])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    update(client.id, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      budgetHealth: form.budgetHealth,
      status: form.status,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update client info</DialogTitle>
          <DialogDescription>
            Adjust the contact details and profile of {client.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="client-name">Name</Label>
            <Input
              id="client-name"
              value={form.name}
              onChange={event => setForm(state => ({ ...state, name: event.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                value={form.email}
                onChange={event => setForm(state => ({ ...state, email: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-phone">Phone</Label>
              <Input
                id="client-phone"
                value={form.phone}
                onChange={event => setForm(state => ({ ...state, phone: event.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Budget health</Label>
              <Select
                value={form.budgetHealth}
                onValueChange={value =>
                  setForm(state => ({ ...state, budgetHealth: value as Client['budgetHealth'] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_track">On Track</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="over_budget">Over Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={value =>
                  setForm(state => ({ ...state, status: value as Client['status'] }))
                }
              >
                <SelectTrigger>
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
