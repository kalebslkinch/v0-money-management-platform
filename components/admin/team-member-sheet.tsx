'use client'

import { Mail, Phone, Building2, Calendar, Pencil, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
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

interface TeamMemberSheetProps {
  member: TeamMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (member: TeamMember) => void
  onDelete: (id: string) => void
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="text-sm text-muted-foreground w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm font-medium flex-1">{value ?? '—'}</span>
    </div>
  )
}

export function TeamMemberSheet({
  member,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TeamMemberSheetProps) {
  if (!member) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[420px] overflow-y-auto">
        <SheetHeader className="pb-0">
          <SheetTitle className="sr-only">Team Member Details</SheetTitle>
          <SheetDescription className="sr-only">Full profile for {member.name}</SheetDescription>
        </SheetHeader>

        {/* Profile header */}
        <div className="flex flex-col items-center gap-3 pt-6 pb-4 text-center">
          <Avatar className="size-20">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{member.name}</h2>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={roleStyles[member.role]}>
              {roleLabels[member.role]}
            </Badge>
            <Badge variant="outline" className={statusStyles[member.status]}>
              {statusLabels[member.status]}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Details */}
        <div className="py-4 space-y-1">
          {member.phone && (
            <DetailRow
              label="Phone"
              value={
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" />
                  {member.phone}
                </span>
              }
            />
          )}
          {member.department && (
            <DetailRow
              label="Department"
              value={
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-muted-foreground" />
                  {member.department}
                </span>
              }
            />
          )}
          <DetailRow
            label="Joined"
            value={
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                {formatDate(member.joinedAt)}
              </span>
            }
          />
          <DetailRow label="Record ID" value={<span className="font-mono text-xs">{member.id}</span>} />
          <DetailRow label="Created" value={formatDate(member.createdAt)} />
          <DetailRow label="Last Updated" value={formatDate(member.updatedAt)} />
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            className="flex-1 gap-2"
            onClick={() => {
              onOpenChange(false)
              onEdit(member)
            }}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => {
              onOpenChange(false)
              onDelete(member.id)
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
