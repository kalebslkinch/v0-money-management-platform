'use client'

import * as React from 'react'
import { useRouter } from 'next/router'
import {
  Search,
  Command as CommandIcon,
  CreditCard,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useUserRole } from '@/hooks/use-user-role'
import {
  getClientResults,
  getAdviserResults,
  getTransactionResults,
  mockAdvisors,
  type SearchResult,
  type SearchResultKind,
  type ManagerFilters,
  type RiskFilter,
  type DateFilter,
} from '@/lib/data/search-index'

// ---------------------------------------------------------------------------
// Icons per result kind
// ---------------------------------------------------------------------------

function KindIcon({ kind }: { kind: SearchResultKind }) {
  switch (kind) {
    case 'transaction': return <CreditCard className="size-4 text-muted-foreground shrink-0" />
    default:            return <Search className="size-4 text-muted-foreground shrink-0" />
  }
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ')
  return <>{parts[0]?.[0] ?? ''}{parts[1]?.[0] ?? ''}</>
}

// ---------------------------------------------------------------------------
// Individual result row
// ---------------------------------------------------------------------------

function ResultRow({ result }: { result: SearchResult }) {
  const hasAvatar = result.kind === 'client' || result.kind === 'adviser'
  const avatarColour =
    result.kind === 'client'  ? 'bg-primary/10 text-primary' :
    result.kind === 'adviser' ? 'bg-chart-1/10 text-chart-1' : ''

  return (
    <div className="flex items-center gap-3 w-full min-w-0">
      {hasAvatar ? (
        <div className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${avatarColour}`}>
          <Initials name={result.title} />
        </div>
      ) : (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
          <KindIcon kind={result.kind} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">{result.title}</p>
        {result.subtitle && (
          <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">{result.subtitle}</p>
        )}
      </div>

      {result.badge && (
        <Badge
          variant={result.badgeStatus ?? 'secondary'}
          className="text-[10px] capitalize shrink-0 ml-auto"
        >
          {result.badge}
        </Badge>
      )}

    </div>
  )
}

// ---------------------------------------------------------------------------
// Manager filter bar
// ---------------------------------------------------------------------------

const DEFAULT_FILTERS: ManagerFilters = { adviser: 'all', risk: 'all', date: 'all' }

function ManagerFilterBar({
  filters,
  onChange,
}: {
  filters: ManagerFilters
  onChange: (f: ManagerFilters) => void
}) {
  const hasActive =
    filters.adviser !== 'all' || filters.risk !== 'all' || filters.date !== 'all'

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 pt-2.5 pb-2 border-b bg-muted/30">
      <SlidersHorizontal className="size-3.5 text-muted-foreground shrink-0" />

      {/* Adviser filter */}
      <Select
        value={filters.adviser}
        onValueChange={v => onChange({ ...filters, adviser: v })}
      >
        <SelectTrigger className="h-6 text-xs rounded-full border-dashed px-2.5 w-auto gap-1 bg-background">
          <SelectValue placeholder="Adviser" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Advisers</SelectItem>
          {mockAdvisors.map(a => (
            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Client type / risk filter */}
      <Select
        value={filters.risk}
        onValueChange={v => onChange({ ...filters, risk: v as RiskFilter })}
      >
        <SelectTrigger className="h-6 text-xs rounded-full border-dashed px-2.5 w-auto gap-1 bg-background">
          <SelectValue placeholder="Client type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Client Types</SelectItem>
          <SelectItem value="low">Low Risk</SelectItem>
          <SelectItem value="moderate">Moderate Risk</SelectItem>
          <SelectItem value="high">High Risk</SelectItem>
        </SelectContent>
      </Select>

      {/* Date filter */}
      <Select
        value={filters.date}
        onValueChange={v => onChange({ ...filters, date: v as DateFilter })}
      >
        <SelectTrigger className="h-6 text-xs rounded-full border-dashed px-2.5 w-auto gap-1 bg-background">
          <SelectValue placeholder="Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="3m">Last 3 months</SelectItem>
          <SelectItem value="1y">Last year</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear all filters */}
      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground rounded-full"
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          <X className="size-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main GlobalSearch component
// ---------------------------------------------------------------------------

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const [filters, setFilters] = React.useState<ManagerFilters>(DEFAULT_FILTERS)
  const [isMac, setIsMac] = React.useState(false)
  const { role, user, isHydrated } = useUserRole()
  const router = useRouter()

  // Detect platform after mount to avoid SSR mismatch
  React.useEffect(() => {
    setIsMac(/mac/i.test(navigator.platform))
  }, [])

  const effectiveRole = isHydrated ? role : 'manager'

  // Reset filters when dialog closes
  React.useEffect(() => {
    if (!open) setFilters(DEFAULT_FILTERS)
  }, [open])

  // ⌘K / Ctrl+K global shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Build role-aware search data, re-computed when filters change
  const clientResults = React.useMemo(
    () => getClientResults(effectiveRole, user.advisorId, { adviser: filters.adviser, risk: filters.risk }),
    [effectiveRole, user.advisorId, filters.adviser, filters.risk],
  )

  const adviserResults = React.useMemo(
    () => getAdviserResults(effectiveRole),
    [effectiveRole],
  )

  const transactionResults = React.useMemo(
    () => getTransactionResults(
      effectiveRole,
      user.advisorId,
      user.clientId,
      { adviser: filters.adviser, date: filters.date },
    ),
    [effectiveRole, user.advisorId, user.clientId, filters.adviser, filters.date],
  )

  function handleSelect(href: string) {
    setOpen(false)
    router.push(href)
  }

  const placeholder =
    effectiveRole === 'manager' ? 'Search clients, advisers, transactions…' :
    effectiveRole === 'fa'      ? 'Search clients, transactions…' :
                                  'Search transactions and budgets…'

  return (
    <>
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open global search"
        className="relative flex items-center gap-2 h-10 w-full max-w-xs px-3 rounded-xl bg-accent/50 text-sm text-muted-foreground/70 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 md:w-64"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left text-sm truncate">Search…</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          {isMac ? <><CommandIcon className="size-3" />K</> : 'Ctrl K'}
        </kbd>
      </button>

      {/* ── Dialog ── */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Global Search"
        description="Search across the platform. Results are filtered by your role."
        className="max-w-2xl"
        showCloseButton={false}
      >
        {/* Manager-only filter bar */}
        {effectiveRole === 'manager' && (
          <ManagerFilterBar filters={filters} onChange={setFilters} />
        )}

        <CommandInput placeholder={placeholder} autoFocus />

        <CommandList className="max-h-[440px]">
          <CommandEmpty className="py-10 text-muted-foreground">
            No results found.
          </CommandEmpty>

          {/* 1. Clients — highest priority for manager & FA */}
          {clientResults.length > 0 && (
            <CommandGroup heading="Clients">
              {clientResults.map(r => (
                <CommandItem
                  key={r.id}
                  value={r.searchValue}
                  onSelect={() => handleSelect(r.href)}
                >
                  <ResultRow result={r} />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* 2. Staff (manager only) */}
          {adviserResults.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Staff">
                {adviserResults.map(r => (
                  <CommandItem
                    key={r.id}
                    value={r.searchValue}
                    onSelect={() => handleSelect(r.href)}
                  >
                    <ResultRow result={r} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* 3. Transactions */}
          {transactionResults.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Transactions">
                {transactionResults.map(r => (
                  <CommandItem
                    key={r.id}
                    value={r.searchValue}
                    onSelect={() => handleSelect(r.href)}
                  >
                    <ResultRow result={r} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>

        {/* Footer hint */}
        <div className="flex items-center gap-3 px-3 py-2 border-t text-[11px] text-muted-foreground">
          <span><kbd className="font-mono bg-muted border border-border rounded px-1">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono bg-muted border border-border rounded px-1">↵</kbd> open</span>
          <span><kbd className="font-mono bg-muted border border-border rounded px-1">esc</kbd> close</span>
          <span className="ml-auto opacity-60">
            {effectiveRole === 'manager' ? 'Showing all data' :
             effectiveRole === 'fa' ? 'Showing your clients' :
             'Showing your account'}
          </span>
        </div>
      </CommandDialog>
    </>
  )
}
