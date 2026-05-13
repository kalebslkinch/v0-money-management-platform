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

const riskStyles = {
  low: 'bg-chart-2/10 text-chart-2',
  moderate: 'bg-chart-4/10 text-chart-4',
  high: 'bg-destructive/10 text-destructive',
}

export function ClientTable({
  clients,
  showAdvisor = true,
  allowActions = true,
}: ClientTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<'name' | 'portfolioValue' | 'lastActivity'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const filteredClients = clients
    .filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter
      const matchesRisk = riskFilter === 'all' || client.riskLevel === riskFilter
      return matchesSearch && matchesStatus && matchesRisk
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortField === 'portfolioValue') {
        comparison = a.portfolioValue - b.portfolioValue
      } else if (sortField === 'lastActivity') {
        comparison = new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime()
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

  const handleSort = (field: 'name' | 'portfolioValue' | 'lastActivity') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 bg-accent/50 border-0 rounded-xl placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-11 rounded-xl border-0 bg-accent/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[130px] h-11 rounded-xl border-0 bg-accent/50">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="h-12">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort('name')}
                >
                  Client
                  <ArrowUpDown className="ml-2 size-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort('portfolioValue')}
                >
                  Portfolio Value
                  <ArrowUpDown className="ml-2 size-3" />
                </Button>
              </TableHead>
              <TableHead className="text-muted-foreground">Risk Level</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort('lastActivity')}
                >
                  Last Activity
                  <ArrowUpDown className="ml-2 size-3" />
                </Button>
              </TableHead>
              {showAdvisor && <TableHead className="text-muted-foreground">Advisor</TableHead>}
              {allowActions && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5 + Number(showAdvisor) + Number(allowActions)} className="h-32">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Users className="size-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium">No clients found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow 
                  key={client.id} 
                  className="group hover:bg-accent/50 border-b border-border/30 last:border-0"
                >
                  <TableCell>
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="size-10 ring-2 ring-border group-hover:ring-primary/30 transition-all">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-chart-2/20 text-primary text-xs font-semibold">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {client.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatCurrency(client.portfolioValue)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-semibold capitalize',
                      riskStyles[client.riskLevel]
                    )}>
                      {client.riskLevel}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-semibold capitalize',
                      statusStyles[client.status]
                    )}>
                      {client.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(client.lastActivity)}
                  </TableCell>
                  {showAdvisor && <TableCell className="text-muted-foreground">{client.advisor}</TableCell>}
                  {allowActions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem asChild className="rounded-lg">
                            <Link href={`/admin/clients/${client.id}`}>
                              <Eye className="mr-2 size-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg">
                            <Mail className="mr-2 size-4" />
                            Send Email
                          </DropdownMenuItem>
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

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredClients.length}</span> of{' '}
          <span className="font-medium text-foreground">{clients.length}</span> clients
        </p>
      </div>
    </div>
  )
}
