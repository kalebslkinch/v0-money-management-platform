import { useState, useMemo } from 'react'
import { Plus, Search, Folder } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { CreateCaseDialog } from '@/components/admin/create-case-dialog'
import { RouteGuard } from '@/components/auth/route-guard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { useUserRole } from '@/hooks/use-user-role'
import { mockCases, deleteCase } from '@/lib/data/mock-cases'
import { cn } from '@/lib/utils'
import type { Case, CaseStatus } from '@/lib/types/admin'

const statusStyles: Record<CaseStatus, string> = {
  open: 'bg-blue-500/10 text-blue-600 border-blue-200',
  in_progress: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  pending_review: 'bg-warning/10 text-warning border-warning/20',
  resolved: 'bg-success/10 text-success border-success/20',
  escalated: 'bg-destructive/10 text-destructive border-destructive/20',
}

const statusLabels: Record<CaseStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  pending_review: 'Pending Review',
  resolved: 'Resolved',
  escalated: 'Escalated',
}

const priorityStyles = {
  low: 'bg-muted text-muted-foreground border-border',
  medium: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
}

const caseTypeLabels: Record<string, string> = {
  onboarding: 'Onboarding',
  annual_review: 'Annual Review',
  compliance: 'Compliance',
  complaint: 'Complaint',
  rebalance: 'Rebalance',
  kyc_update: 'KYC Update',
  general: 'General',
}

export default function CasesPage() {
  const { effectiveRole, currentUser } = useUserRole()
  const [cases, setCases] = useState<Case[]>(mockCases)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<Case | null>(null)

  const isFA = effectiveRole === 'fa'
  const advisorId = currentUser?.advisorId ?? 'ADV001'
  const advisorName = currentUser?.name ?? 'James Wilson'

  const visibleCases = useMemo(() => {
    return cases.filter(c => isFA ? c.advisorId === advisorId : true)
  }, [cases, isFA, advisorId])

  const visibleClientIds = isFA
    ? [...new Set(visibleCases.map(c => c.clientId))]
    : undefined

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return visibleCases.filter(c => {
      const matchesSearch = !q || c.title.toLowerCase().includes(q) || c.clientName.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [visibleCases, search, statusFilter])

  const handleNewCase = (newCase: Case) => {
    setCases(prev => [newCase, ...prev])
  }

  const confirmDelete = () => {
    if (!removeTarget) return
    deleteCase(removeTarget.id)
    setCases(prev => prev.filter(c => c.id !== removeTarget.id))
    setRemoveTarget(null)
  }

  return (
    <RouteGuard allowedRoles={['manager', 'fa']}>
      <AdminHeader title="Cases" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-8">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Cases</h1>
                <p className="text-muted-foreground mt-1">
                  {isFA ? 'Track and manage your client cases.' : 'Monitor all active client cases across the team.'}
                </p>
              </div>
              <Button
                className="rounded-xl h-11 px-5 bg-primary hover:bg-primary/90"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-2 size-4" />
                New Case
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  className="pl-9 rounded-xl"
                  placeholder="Search cases…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as CaseStatus | 'all')}>
                <SelectTrigger className="rounded-xl w-44">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {(Object.keys(statusLabels) as CaseStatus[]).map(s => (
                    <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Folder className="size-10 mb-3 opacity-30" />
                  <p className="text-sm">No cases found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Client</TableHead>
                      {!isFA && <TableHead>Advisor</TableHead>}
                      <TableHead>Status</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead className="w-[52px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(c => (
                      <TableRow key={c.id} className="hover:bg-muted/30">
                        <TableCell>
                          <p className="font-medium text-sm leading-tight max-w-[260px] truncate">{c.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.id}</p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {caseTypeLabels[c.type] ?? c.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-xs capitalize', priorityStyles[c.priority])}>
                            {c.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{c.clientName}</TableCell>
                        {!isFA && <TableCell className="text-sm">{c.advisorName}</TableCell>}
                        <TableCell>
                          <Badge variant="outline" className={cn('text-xs', statusStyles[c.status])}>
                            {statusLabels[c.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.dueDate}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
                            onClick={() => setRemoveTarget(c)}
                          >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </main>

      <CreateCaseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleNewCase}
        advisorId={advisorId}
        advisorName={advisorName}
        visibleClientIds={visibleClientIds}
      />

      <AlertDialog open={removeTarget !== null} onOpenChange={open => { if (!open) setRemoveTarget(null) }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete case?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{removeTarget?.title}&rdquo; will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RouteGuard>
  )
}
