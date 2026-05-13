'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Advisor } from '@/lib/types/admin'
import { formatCurrency, formatPercentage, getInitials } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

const roleLabels: Record<Advisor['role'], string> = {
  senior_advisor: 'Senior Advisor',
  advisor: 'Advisor',
  junior_advisor: 'Junior Advisor',
}

const roleStyles: Record<Advisor['role'], string> = {
  senior_advisor: 'bg-primary/10 text-primary border-primary/20',
  advisor: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  junior_advisor: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
}

const statusStyles: Record<Advisor['status'], string> = {
  active: 'bg-success/10 text-success border-success/20',
  on_leave: 'bg-warning/10 text-warning border-warning/20',
  inactive: 'bg-muted text-muted-foreground border-muted',
}

const statusLabels: Record<Advisor['status'], string> = {
  active: 'Active',
  on_leave: 'On Leave',
  inactive: 'Inactive',
}

interface StaffTableProps {
  advisors: Advisor[]
  onEdit?: (advisor: Advisor) => void
  onRemove?: (advisor: Advisor) => void
}

export function StaffTable({ advisors, onEdit, onRemove }: StaffTableProps) {
  const [search, setSearch] = useState('')
  const [removeTarget, setRemoveTarget] = useState<Advisor | null>(null)

  const filtered = advisors.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search staff..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Advisor</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Clients</TableHead>
              <TableHead className="text-right">AUM Managed</TableHead>
              <TableHead className="text-right">Open Cases</TableHead>
              <TableHead className="text-right">Monthly Return</TableHead>
              <TableHead>Status</TableHead>
              {(onEdit || onRemove) && <TableHead className="w-[52px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No staff found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(advisor => (
                <TableRow key={advisor.id} className="hover:bg-muted/30 cursor-pointer">
                  <TableCell>
                    <Link href={`/admin/staff/${advisor.id}`} className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(advisor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{advisor.name}</p>
                        <p className="text-xs text-muted-foreground">{advisor.email}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-xs', roleStyles[advisor.role])}>
                      {roleLabels[advisor.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {advisor.clientIds.length}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {advisor.totalAUM > 0 ? formatCurrency(advisor.totalAUM, true) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      'font-medium tabular-nums',
                      advisor.activeCaseCount > 3 ? 'text-warning' : ''
                    )}>
                      {advisor.activeCaseCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={cn(
                      'flex items-center justify-end gap-1 text-sm font-medium',
                      advisor.performance.monthly >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {advisor.performance.monthly >= 0
                        ? <TrendingUp className="size-3" />
                        : <TrendingDown className="size-3" />}
                      <span className="tabular-nums">{formatPercentage(advisor.performance.monthly)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-xs capitalize', statusStyles[advisor.status])}>
                      {statusLabels[advisor.status]}
                    </Badge>
                  </TableCell>
                  {(onEdit || onRemove) && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(advisor)}>
                              <Pencil className="mr-2 size-4" />
                              Edit Staff
                            </DropdownMenuItem>
                          )}
                          {onRemove && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setRemoveTarget(advisor)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Remove
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={removeTarget !== null} onOpenChange={open => { if (!open) setRemoveTarget(null) }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removeTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {removeTarget?.name} from the team. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (removeTarget) onRemove?.(removeTarget)
                setRemoveTarget(null)
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
