'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
}

export function StaffTable({ advisors }: StaffTableProps) {
  const [search, setSearch] = useState('')

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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
