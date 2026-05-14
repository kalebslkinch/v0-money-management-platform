'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import { getActiveAdvisors } from '@/lib/data/mock-advisors'
import type { Client } from '@/lib/types/admin'

interface EditClientDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Edit dialog used by SRD-A04 to let advisers (and managers) update key
 * client details. Also manages the secondary "collaborator" advisers
 * authorised to view this client (SRD-A13). Persists overrides locally;
 * safe to wire to a real API later.
 */
export function EditClientDialog({ client, open, onOpenChange }: EditClientDialogProps) {
  const { update } = useClientOverrides()
  const [form, setForm] = useState<ClientOverride>({
    name: client.name,
    email: client.email,
    phone: client.phone,
    riskLevel: client.riskLevel,
    status: client.status,
    collaboratorAdvisorIds: client.collaboratorAdvisorIds ?? [],
  })

  useEffect(() => {
    if (open) {
      setForm({
        name: client.name,
        email: client.email,
        phone: client.phone,
        riskLevel: client.riskLevel,
        status: client.status,
        collaboratorAdvisorIds: client.collaboratorAdvisorIds ?? [],
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
      riskLevel: form.riskLevel,
      status: form.status,
      collaboratorAdvisorIds: form.collaboratorAdvisorIds,
    })
    onOpenChange(false)
  }

  const collaboratorOptions = getActiveAdvisors().filter(
    advisor => advisor.id !== client.advisorId,
  )

  function toggleCollaborator(advisorId: string, checked: boolean) {
    setForm(state => {
      const current = state.collaboratorAdvisorIds ?? []
      const next = checked
        ? [...current, advisorId]
        : current.filter(id => id !== advisorId)
      return { ...state, collaboratorAdvisorIds: next }
    })
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
              <Label>Risk level</Label>
              <Select
                value={form.riskLevel}
                onValueChange={value =>
                  setForm(state => ({ ...state, riskLevel: value as Client['riskLevel'] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
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
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Collaborating advisers (SRD-A13)
            </Label>
            <div className="rounded-lg border p-2 max-h-32 overflow-y-auto space-y-1">
              {collaboratorOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No other active advisers available.
                </p>
              ) : (
                collaboratorOptions.map(advisor => {
                  const checked = form.collaboratorAdvisorIds?.includes(advisor.id) ?? false
                  return (
                    <label
                      key={advisor.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={value =>
                          toggleCollaborator(advisor.id, value === true)
                        }
                      />
                      <span>{advisor.name}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {advisor.role.replace('_', ' ')}
                      </Badge>
                    </label>
                  )
                })
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Authorised collaborators can view and contribute to this client&apos;s file.
            </p>
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
