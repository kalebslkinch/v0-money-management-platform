import { subDays, subMonths, subYears, parseISO, isAfter } from 'date-fns'
import type { UserRole } from '@/lib/auth/user-context'
import { mockClients } from './mock-clients'
import { mockAdvisors } from './mock-advisors'
import { mockTransactions } from './mock-transactions'

export type SearchResultKind = 'page' | 'client' | 'transaction' | 'adviser'

export interface SearchResult {
  id: string
  kind: SearchResultKind
  title: string
  subtitle?: string
  href: string
  badge?: string
  badgeStatus?: 'default' | 'secondary' | 'destructive' | 'outline'
  searchValue: string // flattened string cmdk uses for filtering
}

export type RiskFilter = 'all' | 'low' | 'moderate' | 'high'
export type DateFilter = 'all' | '7d' | '30d' | '3m' | '1y'
export type AdviserFilter = 'all' | string

export interface ManagerFilters {
  adviser: AdviserFilter
  risk: RiskFilter
  date: DateFilter
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

interface NavEntry {
  title: string
  href: string
  roles: UserRole[]
  keywords?: string
}

const NAV_ITEMS: NavEntry[] = [
  { title: 'Dashboard', href: '/admin', roles: ['manager', 'fa', 'customer'], keywords: 'home overview' },
  { title: 'Clients', href: '/admin/clients', roles: ['manager', 'fa'], keywords: 'customers people accounts' },
  { title: 'Portfolios', href: '/admin/portfolios', roles: ['manager', 'fa'], keywords: 'investments assets holdings' },
  { title: 'Budgets', href: '/admin/portfolios', roles: ['customer'], keywords: 'spending categories savings' },
  { title: 'Transactions', href: '/admin/transactions', roles: ['manager', 'fa'], keywords: 'payments money history' },
  { title: 'Spending', href: '/admin/transactions', roles: ['customer'], keywords: 'payments money history budget' },
  { title: 'Analytics', href: '/admin/analytics', roles: ['manager', 'fa'], keywords: 'charts graphs stats insights' },
  { title: 'Performance', href: '/admin/performance', roles: ['manager'], keywords: 'kpi metrics goals targets' },
  { title: 'Reports', href: '/admin/reports', roles: ['manager', 'fa', 'customer'] },
  { title: 'Requests', href: '/admin/requests', roles: ['manager', 'fa', 'customer'], keywords: 'help support consultation' },
  { title: 'Consultations', href: '/admin/consultations', roles: ['manager', 'fa'], keywords: 'meetings reviews records' },
  { title: 'Team', href: '/admin/staff', roles: ['manager'], keywords: 'staff advisors employees members' },
  { title: 'Tasks', href: '/admin/tasks', roles: ['manager'], keywords: 'to-do actions work items' },
  { title: 'Privacy', href: '/admin/privacy', roles: ['manager', 'fa', 'customer'], keywords: 'consent data gdpr' },
  { title: 'Settings', href: '/admin/settings', roles: ['manager', 'fa', 'customer'], keywords: 'preferences profile account' },
]

export function getNavResults(role: UserRole): SearchResult[] {
  return NAV_ITEMS.filter(n => n.roles.includes(role)).map(n => ({
    id: `page:${n.href}:${n.title}`,
    kind: 'page',
    title: n.title,
    href: n.href,
    searchValue: `page ${n.title} ${n.keywords ?? ''}`,
  }))
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export function getClientResults(
  role: UserRole,
  advisorId: string | undefined,
  filters?: Pick<ManagerFilters, 'adviser' | 'risk'>,
): SearchResult[] {
  if (role === 'customer') return []

  let clients = role === 'manager'
    ? mockClients
    : mockClients.filter(c => c.advisorId === advisorId)

  if (role === 'manager' && filters) {
    if (filters.adviser !== 'all') {
      clients = clients.filter(c => c.advisorId === filters.adviser)
    }
    if (filters.risk !== 'all') {
      clients = clients.filter(c => c.budgetHealth === filters.risk)
    }
  }

  return clients.map(c => ({
    id: `client:${c.id}`,
    kind: 'client',
    title: c.name,
    subtitle: [c.advisor, c.email].filter(Boolean).join(' · '),
    href: `/admin/clients/${c.id}`,
    badge: c.budgetHealth,
    badgeStatus: 'secondary',
    searchValue: `client ${c.name} ${c.email} ${c.advisor ?? ''} ${c.budgetHealth} ${c.status}`,
  }))
}

// ---------------------------------------------------------------------------
// Advisers (manager only)
// ---------------------------------------------------------------------------

export function getAdviserResults(role: UserRole): SearchResult[] {
  if (role !== 'manager') return []

  return mockAdvisors.map(a => ({
    id: `adviser:${a.id}`,
    kind: 'adviser',
    title: a.name,
    subtitle: a.email,
    href: '/admin/staff',
    badge: a.role.replace(/_/g, ' '),
    badgeStatus: 'secondary',
    searchValue: `adviser staff ${a.name} ${a.email} ${a.role}`,
  }))
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

function getDateThreshold(filter: DateFilter): Date | null {
  const now = new Date()
  switch (filter) {
    case '7d': return subDays(now, 7)
    case '30d': return subDays(now, 30)
    case '3m': return subMonths(now, 3)
    case '1y': return subYears(now, 1)
    default: return null
  }
}

export function getTransactionResults(
  role: UserRole,
  advisorId: string | undefined,
  clientId: string | undefined,
  filters?: Pick<ManagerFilters, 'adviser' | 'date'>,
): SearchResult[] {
  let txns = [...mockTransactions]

  if (role === 'customer') {
    txns = txns.filter(t => t.clientId === clientId)
  } else if (role === 'fa') {
    const myClientIds = new Set(
      mockClients.filter(c => c.advisorId === advisorId).map(c => c.id),
    )
    txns = txns.filter(t => myClientIds.has(t.clientId))
  } else if (role === 'manager' && filters) {
    if (filters.adviser !== 'all') {
      const adviserClientIds = new Set(
        mockClients.filter(c => c.advisorId === filters.adviser).map(c => c.id),
      )
      txns = txns.filter(t => adviserClientIds.has(t.clientId))
    }
  }

  const threshold = filters ? getDateThreshold(filters.date) : null
  if (threshold) {
    txns = txns.filter(t => {
      if (!t.date) return false
      try { return isAfter(parseISO(t.date), threshold) } catch { return false }
    })
  }

  return txns.slice(0, 15).map(t => {
    const amount = `£${t.amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    return {
      id: `txn:${t.id}`,
      kind: 'transaction',
      title: t.description ?? `${t.type} ${amount}`,
      subtitle: `${t.clientName ?? t.clientId} · ${amount}`,
      href: '/admin/transactions',
      badge: t.status,
      badgeStatus: t.status === 'completed' ? 'secondary' : t.status === 'failed' ? 'destructive' : 'outline',
      searchValue: `transaction ${t.type} ${t.clientName ?? ''} ${t.description ?? ''} ${t.id} ${t.status}`,
    }
  })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export { mockAdvisors }
