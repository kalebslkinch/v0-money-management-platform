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
  // Hide portfolio, risk, advisor columns for customer role
  const isCustomer = !showAdvisor && !allowActions
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

  if (isCustomer) return null

  return (
    <div className="space-y-6">
      {/* ...existing code for manager/fa... */}
    </div>
  )
}
