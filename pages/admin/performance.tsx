'use client'

import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Gauge,
  Smile,
  CheckCircle2,
  Timer,
  Download,
  Filter,
  Users,
  Activity,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { RouteGuard } from '@/components/auth/route-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
import { mockAdvisors, getActiveAdvisors } from '@/lib/data/mock-advisors'
import { mockCases } from '@/lib/data/mock-cases'
import { mockClients } from '@/lib/data/mock-clients'
import { useConsultationRequests } from '@/hooks/use-store'
import { exportData } from '@/lib/utils/export'
import type { Case } from '@/lib/types/admin'
import type { AdvisorPerformanceSnapshot, TeamInsightPoint } from '@/lib/types/store'
import { SmartRecommendationsPanel } from '@/components/admin/smart-recommendations-panel'
import { QuarterlyTrendReport } from '@/components/admin/quarterly-trend-report'

/**
 * Manager-only performance dashboard (SRD-M04) and anonymised team insights
 * for trend analysis (SRD-M05). Includes adviser / client-type / date
 * filters (SRD-M06).
 */
function PerformancePageInner() {
  // ── Filters (SRD-M06) ──
  const [advisorFilter, setAdvisorFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sinceInception, setSinceInception] = useState(false)

  const { requests } = useConsultationRequests()
  const advisors = getActiveAdvisors()

  const filteredCases = useMemo(
    () => filterCases(mockCases, { advisorFilter, fromDate: sinceInception ? '' : fromDate, toDate: sinceInception ? '' : toDate, search }),
    [advisorFilter, fromDate, toDate, search, sinceInception],
  )

  const filteredClients = useMemo(
    () =>
      mockClients.filter(client => {
        if (advisorFilter !== 'all' && client.advisorId !== advisorFilter) return false
        if (riskFilter !== 'all' && client.riskLevel !== riskFilter) return false
        if (statusFilter !== 'all' && client.status !== statusFilter) return false
        if (search.trim()) {
          const term = search.toLowerCase()
          if (!client.name.toLowerCase().includes(term) && !client.email.toLowerCase().includes(term)) {
            return false
          }
        }
        return true
      }),
    [advisorFilter, riskFilter, statusFilter, search],
  )

  // ── Per-advisor metrics (SRD-M04) ──
  const advisorMetrics: AdvisorPerformanceSnapshot[] = useMemo(() => {
    return advisors
      .filter(advisor => advisorFilter === 'all' || advisor.id === advisorFilter)
      .map(advisor => {
        const cases = filteredCases.filter(item => item.advisorId === advisor.id)
        const resolved = cases.filter(item => item.status === 'resolved')
        const open = cases.filter(item => item.status === 'open' || item.status === 'in_progress')
        const completionRate = cases.length === 0 ? 0 : (resolved.length / cases.length) * 100
        const advisorRequests = requests.filter(req => req.assignedAdvisorId === advisor.id)
        const responseTimes = advisorRequests
          .filter(req => req.responses.length > 0)
          .map(req => {
            const created = new Date(req.createdAt).getTime()
            const firstReply = new Date(req.responses[0].createdAt).getTime()
            return Math.max(0, (firstReply - created) / 36e5)
          })
        const avgResponseTimeHours =
          responseTimes.length > 0
            ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length
            : derivedFallbackResponseHours(cases)

        // Mock satisfaction rate derived from client status mix + perf score
        const advisorClients = filteredClients.filter(client => client.advisorId === advisor.id)
        const activeShare = advisorClients.length === 0
          ? 80
          : (advisorClients.filter(client => client.status === 'active').length / advisorClients.length) * 100
        const satisfactionRate = clamp(0, 100, 60 + advisor.performance.monthly * 4 + activeShare * 0.2)

        return {
          advisorId: advisor.id,
          advisorName: advisor.name,
          satisfactionRate,
          completionRate,
          avgResponseTimeHours,
          openCases: open.length,
          resolvedCases: resolved.length,
        }
      })
  }, [advisors, filteredCases, requests, advisorFilter, filteredClients])

  const aggregate = useMemo(() => {
    if (advisorMetrics.length === 0) {
      return { satisfaction: 0, completion: 0, response: 0, openCases: 0, resolvedCases: 0 }
    }
    const sum = advisorMetrics.reduce(
      (acc, item) => ({
        satisfaction: acc.satisfaction + item.satisfactionRate,
        completion: acc.completion + item.completionRate,
        response: acc.response + item.avgResponseTimeHours,
        openCases: acc.openCases + item.openCases,
        resolvedCases: acc.resolvedCases + item.resolvedCases,
      }),
      { satisfaction: 0, completion: 0, response: 0, openCases: 0, resolvedCases: 0 },
    )
    return {
      satisfaction: sum.satisfaction / advisorMetrics.length,
      completion: sum.completion / advisorMetrics.length,
      response: sum.response / advisorMetrics.length,
      openCases: sum.openCases,
      resolvedCases: sum.resolvedCases,
    }
  }, [advisorMetrics])

  // ── Anonymised team-level insights (SRD-M05) ──
  const teamInsights: TeamInsightPoint[] = useMemo(() => buildTeamInsights(filteredCases), [filteredCases])

  function exportPerformance() {
    exportData({
      filename: `team-performance-${new Date().toISOString().slice(0, 10)}`,
      rows: advisorMetrics,
      columns: [
        { key: 'advisorName', label: 'Adviser' },
        { key: 'satisfactionRate', label: 'Satisfaction %', value: row => row.satisfactionRate.toFixed(1) },
        { key: 'completionRate', label: 'Completion %', value: row => row.completionRate.toFixed(1) },
        { key: 'avgResponseTimeHours', label: 'Avg response (h)', value: row => row.avgResponseTimeHours.toFixed(1) },
        { key: 'openCases', label: 'Open cases' },
        { key: 'resolvedCases', label: 'Resolved cases' },
      ],
    })
  }

  function exportTeamInsights() {
    exportData({
      filename: `team-insights-${new Date().toISOString().slice(0, 10)}`,
      rows: teamInsights,
      columns: [
        { key: 'month', label: 'Month' },
        { key: 'totalCases', label: 'Cases (anonymised)' },
        { key: 'avgSatisfaction', label: 'Avg satisfaction %', value: row => row.avgSatisfaction.toFixed(1) },
        { key: 'avgCompletion', label: 'Avg completion %', value: row => row.avgCompletion.toFixed(1) },
        { key: 'avgResponseHours', label: 'Avg response (h)', value: row => row.avgResponseHours.toFixed(1) },
      ],
    })
  }

  return (
    <>
      <AdminHeader title="Team Performance" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Team Performance</h1>
              <p className="text-muted-foreground">
                Satisfaction, completion, and response-time KPIs for advisers and the wider team.
              </p>
            </div>
            <Button variant="outline" onClick={exportPerformance}>
              <Download className="mr-2 size-4" />
              Export performance
            </Button>
          </div>

          {/* Filters (SRD-M06) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="size-4 text-primary" />
                Filters
              </CardTitle>
              <CardDescription>Adviser, client type, and date range.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                    <label className="text-xs text-muted-foreground">Search</label>
                    <Input
                      value={search}
                      onChange={event => setSearch(event.target.value)}
                      placeholder="Adviser, client name…"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Adviser</label>
                    <Select value={advisorFilter} onValueChange={setAdvisorFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All advisers</SelectItem>
                        {mockAdvisors.map(advisor => (
                          <SelectItem key={advisor.id} value={advisor.id}>
                            {advisor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Client risk</label>
                    <Select value={riskFilter} onValueChange={setRiskFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Client status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1.5 w-40">
                    <label className="text-xs text-muted-foreground">From</label>
                    <Input
                      type="date"
                      value={fromDate}
                      disabled={sinceInception}
                      onChange={event => setFromDate(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 w-40">
                    <label className="text-xs text-muted-foreground">To</label>
                    <Input
                      type="date"
                      value={toDate}
                      disabled={sinceInception}
                      onChange={event => setToDate(event.target.value)}
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none pb-2">
                    <Checkbox
                      checked={sinceInception}
                      onCheckedChange={(checked) => {
                        const next = checked === true
                        setSinceInception(next)
                        if (next) {
                          setFromDate('')
                          setToDate('')
                        }
                      }}
                    />
                    <span className="text-sm font-medium leading-none">All time</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aggregate KPIs */}
          <div className="grid gap-4 md:grid-cols-4">
            <KpiCard
              label="Satisfaction"
              value={`${aggregate.satisfaction.toFixed(1)}%`}
              icon={Smile}
              tone="primary"
            />
            <KpiCard
              label="Completion"
              value={`${aggregate.completion.toFixed(1)}%`}
              icon={CheckCircle2}
              tone="success"
            />
            <KpiCard
              label="Avg response time"
              value={`${aggregate.response.toFixed(1)}h`}
              icon={Timer}
              tone="warning"
            />
            <KpiCard
              label="Open cases"
              value={String(aggregate.openCases)}
              subtitle={`${aggregate.resolvedCases} resolved`}
              icon={Activity}
              tone="chart-2"
            />
          </div>

          {/* Per-advisor table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4 text-primary" />
                Adviser performance
              </CardTitle>
              <CardDescription>Filtered to {advisorMetrics.length} adviser(s).</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adviser</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead>Avg response</TableHead>
                    <TableHead className="text-right">Cases</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advisorMetrics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No advisers match these filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    advisorMetrics.map(item => (
                      <TableRow key={item.advisorId}>
                        <TableCell className="font-medium">{item.advisorName}</TableCell>
                        <TableCell className="w-[200px]">
                          <div className="flex items-center gap-2">
                            <Progress value={item.satisfactionRate} className="h-2" />
                            <span className="text-xs tabular-nums w-12 text-right">
                              {item.satisfactionRate.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[200px]">
                          <div className="flex items-center gap-2">
                            <Progress value={item.completionRate} className="h-2" />
                            <span className="text-xs tabular-nums w-12 text-right">
                              {item.completionRate.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="tabular-nums">{item.avgResponseTimeHours.toFixed(1)}h</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="mr-1">
                            {item.openCases} open
                          </Badge>
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            {item.resolvedCases} done
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Anonymised team-level insights (SRD-M05) */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Gauge className="size-4 text-primary" />
                    Anonymised business trend
                  </CardTitle>
                  <CardDescription>Aggregated, identity-stripped monthly KPIs.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportTeamInsights}>
                  <Download className="mr-2 size-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={teamInsights}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                      <YAxis tickLine={false} axisLine={false} className="text-xs" width={40} />
                      <Tooltip
                        formatter={(value: number, name) =>
                          name === 'avgResponseHours' ? `${value.toFixed(1)}h` : `${value.toFixed(1)}%`
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="avgSatisfaction"
                        name="Satisfaction"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="avgCompletion"
                        name="Completion"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Case volume by month</CardTitle>
                <CardDescription>Anonymised volumes for trend analysis.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamInsights}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                      <YAxis tickLine={false} axisLine={false} className="text-xs" width={40} />
                      <Tooltip />
                      <Bar dataKey="totalCases" name="Cases" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Smart recommendations (SRD-M16) and auto-quarterly trend (SRD-M19) */}
          <SmartRecommendationsPanel snapshots={advisorMetrics} />
          <QuarterlyTrendReport insights={teamInsights} />

          {/* Filtered client list — supports SRD-M06 visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Clients matching filters</CardTitle>
              <CardDescription>{filteredClients.length} client(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Adviser</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No clients match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.slice(0, 10).map(client => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.advisor}</TableCell>
                        <TableCell className="capitalize">{client.riskLevel}</TableCell>
                        <TableCell className="capitalize">{client.status}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(client.joinedDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

interface KpiCardProps {
  label: string
  value: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  tone: 'primary' | 'success' | 'warning' | 'chart-2'
}

function KpiCard({ label, value, subtitle, icon: Icon, tone }: KpiCardProps) {
  const colorClass = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    'chart-2': 'bg-chart-2/10 text-chart-2',
  }[tone]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-full ${colorClass}`}>
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl font-bold tabular-nums">{value}</p>
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value))
}

function derivedFallbackResponseHours(cases: Case[]): number {
  if (cases.length === 0) return 0
  // Average elapsed hours from createdAt to updatedAt as a proxy
  const total = cases.reduce((sum, item) => {
    const created = new Date(item.createdAt).getTime()
    const updated = new Date(item.updatedAt).getTime()
    return sum + Math.max(0, (updated - created) / 36e5)
  }, 0)
  return total / cases.length
}

const MS_PER_DAY = 86_400_000

interface CaseFilterOptions {
  advisorFilter: string
  fromDate: string
  toDate: string
  search: string
}

function filterCases(items: Case[], options: CaseFilterOptions): Case[] {
  const { advisorFilter, fromDate, toDate, search } = options
  const term = search.toLowerCase().trim()
  const fromTime = fromDate ? new Date(fromDate).getTime() : -Infinity
  // Add one day in ms so the "to" date is inclusive of the entire selected day
  const toTime = toDate ? new Date(toDate).getTime() + MS_PER_DAY : Infinity

  return items.filter(item => {
    if (advisorFilter !== 'all' && item.advisorId !== advisorFilter) return false
    const created = new Date(item.createdAt).getTime()
    if (created < fromTime || created > toTime) return false
    if (term) {
      const haystack = `${item.title} ${item.clientName} ${item.advisorName}`.toLowerCase()
      if (!haystack.includes(term)) return false
    }
    return true
  })
}

function buildTeamInsights(cases: Case[]): TeamInsightPoint[] {
  const byMonth = new Map<string, { count: number; resolved: number; responseHoursTotal: number; responseHoursSamples: number }>()
  cases.forEach(item => {
    const date = new Date(item.createdAt)
    const month = date.toLocaleString('en-GB', { month: 'short', year: '2-digit' })
    const bucket = byMonth.get(month) ?? { count: 0, resolved: 0, responseHoursTotal: 0, responseHoursSamples: 0 }
    bucket.count += 1
    if (item.status === 'resolved') bucket.resolved += 1
    const responseHours = Math.max(
      0,
      (new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime()) / 36e5,
    )
    bucket.responseHoursTotal += responseHours
    bucket.responseHoursSamples += 1
    byMonth.set(month, bucket)
  })

  return Array.from(byMonth.entries())
    .map(([month, bucket]) => {
      const completion = bucket.count === 0 ? 0 : (bucket.resolved / bucket.count) * 100
      const avgSatisfaction = clamp(0, 100, 70 + completion * 0.3)
      const avgResponseHours =
        bucket.responseHoursSamples === 0 ? 0 : bucket.responseHoursTotal / bucket.responseHoursSamples
      return {
        month,
        avgSatisfaction,
        avgCompletion: completion,
        avgResponseHours,
        totalCases: bucket.count,
      }
    })
    .sort((a, b) => (a.month < b.month ? -1 : 1))
}

export default function PerformancePage() {
  return (
    <RouteGuard allowedRoles={['manager']}>
      <PerformancePageInner />
    </RouteGuard>
  )
}
