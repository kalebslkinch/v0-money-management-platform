'use client'

import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog'
import { CreateTeamMemberDialog } from '@/components/admin/create-team-member-dialog'
import { StaffTable } from '@/components/admin/staff-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { RouteGuard } from '@/components/auth/route-guard'
import { useUserRole } from '@/hooks/use-user-role'
import { useTeamMembers } from '@/hooks/use-store'
import { mockAdvisors } from '@/lib/data/mock-advisors'
import { getInitials, formatDate } from '@/lib/utils/format'
import type { TeamMember } from '@/lib/types/store'

const roleLabels: Record<TeamMember['role'], string> = {
  senior_advisor: 'Senior Advisor',
  advisor: 'Advisor',
  junior_advisor: 'Junior Advisor',
}

const roleStyles: Record<TeamMember['role'], string> = {
  senior_advisor: 'bg-primary/10 text-primary border-primary/20',
  advisor: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  junior_advisor: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
}

const statusStyles: Record<TeamMember['status'], string> = {
  active: 'bg-success/10 text-success border-success/20',
  on_leave: 'bg-warning/10 text-warning border-warning/20',
  inactive: 'bg-muted text-muted-foreground border-muted',
}

const statusLabels: Record<TeamMember['status'], string> = {
  active: 'Active',
  on_leave: 'On Leave',
  inactive: 'Inactive',
}

function StaffPageInner() {
  const { user } = useUserRole()
  const { teamMembers, create, update, remove } = useTeamMembers()

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return teamMembers
    return teamMembers.filter(
      m =>
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        (m.department ?? '').toLowerCase().includes(term),
    )
  }, [teamMembers, search])

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(member: TeamMember) {
    setEditing(member)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AdminHeader title="Team" subtitle="Manage your team members" />

      <main className="flex-1 p-6 space-y-6">
        {/* Existing advisors (mock data reference) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Existing Advisors</CardTitle>
            <CardDescription>Current advisors loaded from the system</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <StaffTable advisors={mockAdvisors} />
          </CardContent>
        </Card>

        {/* Manager-created team members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Team Members</CardTitle>
              <CardDescription>Members you have added manually</CardDescription>
            </div>
            <Button size="sm" onClick={openCreate} className="gap-2">
              <Plus className="size-4" />
              Add Member
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 relative max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {teamMembers.length === 0
                          ? 'No team members yet. Click "Add Member" to create one.'
                          : 'No team members match your search.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(member => (
                      <TableRow key={member.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={roleStyles[member.role]}>
                            {roleLabels[member.role]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {member.department ?? '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(member.joinedAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyles[member.status]}>
                            {statusLabels[member.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => openEdit(member)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:text-destructive"
                              onClick={() => setConfirmId(member.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <CreateTeamMemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onCreate={input => create(input)}
        onUpdate={(id, patch) => update(id, patch)}
      />

      <ConfirmDeleteDialog
        open={confirmId !== null}
        onOpenChange={open => { if (!open) setConfirmId(null) }}
        title="Remove team member"
        description="This will permanently delete this team member record. This action cannot be undone."
        onConfirm={() => {
          if (confirmId) remove(confirmId)
          setConfirmId(null)
        }}
      />
    </div>
  )
}

export default function StaffPage() {
  return (
    <RouteGuard allowedRoles={['manager']}>
      <StaffPageInner />
    </RouteGuard>
  )
}
