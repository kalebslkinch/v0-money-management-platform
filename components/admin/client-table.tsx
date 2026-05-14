'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MoreHorizontal, Eye, Mail, ArrowUpDown, Filter, Users } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils/format'
import type { Client } from '@/lib/types/admin'
import { cn } from '@/lib/utils'

interface ClientTableProps {
  clients: Client[]
  showAdvisor?: boolean
  allowActions?: boolean
}

const statusStyles = {
  active: 'bg-chart-2/10 text-chart-2',
  inactive: 'bg-muted text-muted-foreground',
  pending: 'bg-chart-4/10 text-chart-4',
}

const healthStyles = {
  on_track: 'bg-chart-2/10 text-chart-2',
  at_risk: 'bg-chart-4/10 text-chart-4',
  over_budget: 'bg-destructive/10 text-destructive',
}

export function ClientTable({
  clients,
  showAdvisor = true,
  allowActions = true,
}: ClientTableProps) {
  // Hide portfolio, risk, advisor columns for customer role
  const isCustomer = !showAdvisor && !allowActions
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [healthFilter, setHealthFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<'name' | 'monthlyBudget' | 'lastActivity'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const filteredClients = clients
    .filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter
      const matchesHealth = healthFilter === 'all' || client.budgetHealth === healthFilter
      return matchesSearch && matchesStatus && matchesHealth
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortField === 'monthlyBudget') {
        comparison = a.monthlyBudget - b.monthlyBudget
      } else if (sortField === 'lastActivity') {
        comparison = new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime()
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

  const handleSort = (field: 'name' | 'monthlyBudget' | 'lastActivity') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  if (isCustomer) return null

  return (
    <div className="space-y-6">

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] rounded-xl">
              <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={healthFilter} onValueChange={setHealthFilter}>
            <SelectTrigger className="w-[130px] rounded-xl">
              <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Health" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Health</SelectItem>
              <SelectItem value="on_track">On Track</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
              <SelectItem value="over_budget">Over Budget</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border">
          <Users className="size-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No clients match your filters</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('name')}
                >
                  <span className="flex items-center gap-1.5">
                    Client
                    <ArrowUpDown className={cn('size-3.5 text-muted-foreground', sortField === 'name' && 'text-foreground')} />
                  </span>
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => handleSort('monthlyBudget')}
                >
                  <span className="flex items-center justify-end gap-1.5">
                    Monthly Budget
                    <ArrowUpDown className={cn('size-3.5 text-muted-foreground', sortField === 'monthlyBudget' && 'text-foreground')} />
                  </span>
                </TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Status</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('lastActivity')}
                >
                  <span className="flex items-center gap-1.5">
                    Last Activity
                    <ArrowUpDown className={cn('size-3.5 text-muted-foreground', sortField === 'lastActivity' && 'text-foreground')} />
                  </span>
                </TableHead>
                {showAdvisor && <TableHead>Advisor</TableHead>}
                {allowActions && <TableHead className="w-[52px]" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <Avatar className="size-9 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors leading-tight">
                          {client.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{client.id}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-sm">{client.email}</p>
                      <p className="text-xs text-muted-foreground">{client.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(client.monthlyBudget)}
                  </TableCell>
                  <TableCell>
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize', healthStyles[client.budgetHealth])}>
                      {client.budgetHealth.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize', statusStyles[client.status])}>
                      {client.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {formatDate(client.lastActivity)}
                  </TableCell>
                  {showAdvisor && (
                    <TableCell className="text-sm text-muted-foreground">
                      {client.advisor}
                    </TableCell>
                  )}
                  {allowActions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/clients/${client.id}`}>
                              <Eye className="mr-2 size-4" />
                              View Client
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${client.email}`}>
                              <Mail className="mr-2 size-4" />
                              Send Email
                            </a>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Result count */}
      <p className="text-xs text-muted-foreground">
        Showing {filteredClients.length} of {clients.length} client{clients.length !== 1 ? 's' : ''}
      </p>

    </div>
  )
}
