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
import type { TeamMember, TeamMemberRole, TeamMemberStatus } from '@/lib/types/store'

interface CreateTeamMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: TeamMember | null
  onCreate: (input: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdate: (id: string, patch: Partial<Omit<TeamMember, 'id' | 'createdAt'>>) => void
}

const ROLES: { value: TeamMemberRole; label: string }[] = [
  { value: 'senior_advisor', label: 'Senior Advisor' },
  { value: 'advisor', label: 'Advisor' },
  { value: 'junior_advisor', label: 'Junior Advisor' },
]

const STATUSES: { value: TeamMemberStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'inactive', label: 'Inactive' },
]

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function CreateTeamMemberDialog({
  open,
  onOpenChange,
  editing,
  onCreate,
  onUpdate,
}: CreateTeamMemberDialogProps) {
  const isEditing = !!editing

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<TeamMemberRole>('advisor')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState<TeamMemberStatus>('active')
  const [joinedAt, setJoinedAt] = useState(todayIso())

  useEffect(() => {
    if (!open) return
    if (editing) {
      setName(editing.name)
      setEmail(editing.email)
      setPhone(editing.phone ?? '')
      setRole(editing.role)
      setDepartment(editing.department ?? '')
      setStatus(editing.status)
      setJoinedAt(editing.joinedAt.slice(0, 10))
    } else {
      setName('')
      setEmail('')
      setPhone('')
      setRole('advisor')
      setDepartment('')
      setStatus('active')
      setJoinedAt(todayIso())
    }
  }, [open, editing])

  const isValid = name.trim() !== '' && email.trim() !== ''

  function handleSubmit() {
    if (!isValid) return
    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      role,
      department: department.trim() || undefined,
      status,
      joinedAt,
    }
    if (isEditing && editing) {
      onUpdate(editing.id, payload)
    } else {
      onCreate(payload)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details for this team member.'
              : 'Create a new team member record.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="tm-name">Full Name *</Label>
            <Input
              id="tm-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sarah Johnson"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tm-email">Email *</Label>
            <Input
              id="tm-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="sarah.johnson@firm.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tm-phone">Phone</Label>
            <Input
              id="tm-phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+44 7700 000000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Role *</Label>
              <Select value={role} onValueChange={v => setRole(v as TeamMemberRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Status *</Label>
              <Select value={status} onValueChange={v => setStatus(v as TeamMemberStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tm-dept">Department</Label>
            <Input
              id="tm-dept"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="e.g. Wealth Management"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tm-joined">Joined Date *</Label>
            <Input
              id="tm-joined"
              type="date"
              value={joinedAt}
              onChange={e => setJoinedAt(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {isEditing ? 'Save Changes' : 'Add Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
