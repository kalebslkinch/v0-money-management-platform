import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import { AdminHeader } from '@/components/admin/admin-header'
import { RouteGuard } from '@/components/auth/route-guard'
import { useUserRole } from '@/hooks/use-user-role'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { getVisibleClients, getVisibleTransactions } from '@/lib/utils/role-filters'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import { computeTeamInsights } from '@/lib/utils/team-insights'
import {
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Download,
  Filter,
  BarChart2,
  LineChart as LineChartIcon,
} from 'lucide-react'

const BAR_RANGE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

// ─── CSV export helper ────────────────────────────────────────────────────────

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function AnalyticsPage() {
  const { user } = useUserRole()

  // ── Filter state ─────────────────────────────────────────────────────────
  const [riskTierFilter, setRiskTierFilter] = useState<string>('all')
  const [advisorFilter, setAdvisorFilter] = useState<string>('all')
  const [cashFlowPeriod, setCashFlowPeriod] = useState<'3m' | '6m' | 'all'>('all')
  const [cashFlowChartType, setCashFlowChartType] = useState<'bar' | 'line'>('bar')
  const [categoryChartType, setCategoryChartType] = useState<'bar' | 'line'>('bar')
  const [categoryLimit, setCategoryLimit] = useState<'5' | '10' | 'all'>('5')

  const visibleClients = useMemo(() => getVisibleClients(user), [user])
  const visibleTransactions = useMemo(() => getVisibleTransactions(user), [user])

  const snapshots = useMemo(
    () => visibleClients.map(client => getPFMSSnapshotForCustomer(client.id)),
    [visibleClients],
  )

  const teamInsights = useMemo(() => computeTeamInsights(user), [user])

  const completedTransactions = useMemo(
    () => visibleTransactions.filter(txn => txn.status === 'completed'),
    [visibleTransactions],
  )

  const totalWeeklyBudget = snapshots.reduce(
    (sum, snapshot) =>
      sum + snapshot.categories.reduce((categorySum, category) => categorySum + category.weeklyBudget, 0),
    0,
  )

  const totalSpent = snapshots.reduce(
    (sum, snapshot) =>
      sum + snapshot.categories.reduce((categorySum, category) => categorySum + category.spent, 0),
    0,
  )

  const totalProjected = snapshots.reduce(
    (sum, snapshot) =>
      sum + snapshot.categories.reduce((categorySum, category) => categorySum + category.projectedSpend, 0),
    0,
  )

  const customersOverPace = snapshots.filter(snapshot => {
    const budget = snapshot.categories.reduce((sum, category) => sum + category.weeklyBudget, 0)
    const projected = snapshot.categories.reduce((sum, category) => sum + category.projectedSpend, 0)
    return projected > budget
  }).length

  const budgetUsage = totalWeeklyBudget > 0 ? (totalSpent / totalWeeklyBudget) * 100 : 0

  const monthFlowMap = completedTransactions.reduce<Record<string, { month: string; inflow: number; outflow: number }>>(
    (acc, txn) => {
      const date = new Date(txn.date)
      const month = date.toLocaleString('en-GB', { month: 'short' })
      if (!acc[month]) {
        acc[month] = { month, inflow: 0, outflow: 0 }
      }

      if (txn.type === 'deposit' || txn.type === 'dividend' || txn.type === 'sell') {
        acc[month].inflow += txn.amount
      } else {
        acc[month].outflow += txn.amount
      }

      return acc
    },
    {},
  )

  const cashFlowData = Object.values(monthFlowMap)

  const categoryTotals = snapshots.reduce<Record<string, number>>((acc, snapshot) => {
    snapshot.categories.forEach(category => {
      acc[category.label] = (acc[category.label] ?? 0) + category.spent
    })
    return acc
  }, {})

  const categoryData = Object.entries(categoryTotals)
    .map(([name, spent]) => ({ name, spent }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5)

  // ── Filtered / derived data ───────────────────────────────────────────────

  const allCategoryData = useMemo(
    () =>
      Object.entries(categoryTotals)
        .map(([name, spent]) => ({ name, spent }))
        .sort((a, b) => b.spent - a.spent),
    [categoryTotals],
  )

  const filteredCategoryData = useMemo(() => {
    if (categoryLimit === 'all') return allCategoryData
    return allCategoryData.slice(0, Number(categoryLimit))
  }, [allCategoryData, categoryLimit])

  const filteredCashFlowData = useMemo(() => {
    if (cashFlowPeriod === 'all') return cashFlowData
    return cashFlowData.slice(-(cashFlowPeriod === '3m' ? 3 : 6))
  }, [cashFlowData, cashFlowPeriod])

  const filteredAdvisorTeams = useMemo(() => {
    if (advisorFilter === 'all') return teamInsights.advisorTeams
    return teamInsights.advisorTeams.filter(t => t.label === advisorFilter)
  }, [teamInsights.advisorTeams, advisorFilter])

  const filteredRiskCohorts = useMemo(() => {
    if (riskTierFilter === 'all') return teamInsights.riskCohorts
    return teamInsights.riskCohorts.filter(c => c.label === riskTierFilter)
  }, [teamInsights.riskCohorts, riskTierFilter])

  // ── Export handlers ───────────────────────────────────────────────────────

  const exportCohortCsv = () => {
    const headers = ['Cohort', 'Clients', 'On Track %', 'Total Budget (£)', 'Projected (£)', 'Avg Income Utilisation %']
    const rows = [...filteredAdvisorTeams, ...filteredRiskCohorts].map(c => [
      c.label, c.clientCount, c.onTrackPct, c.totalBudget, c.totalProjected, c.avgIncomeUtilisation,
    ])
    downloadCsv('analytics-cohort-summary.csv', headers, rows)
  }

  const exportCashFlowCsv = () => {
    const headers = ['Month', 'Inflow (£)', 'Outflow (£)']
    downloadCsv('analytics-cash-flow.csv', headers, filteredCashFlowData.map(d => [d.month, d.inflow, d.outflow]))
  }

  const exportCategoryCsv = () => {
    const headers = ['Category', 'Total Spent (£)']
    downloadCsv('analytics-category-spending.csv', headers, filteredCategoryData.map(d => [d.name, d.spent]))
  }

  const exportCategoryPressureCsv = () => {
    const headers = ['Category', 'Total Budget (£)', 'Total Projected (£)', 'Overspend Ratio (%)', 'Clients Over Cap']
    downloadCsv(
      'analytics-category-pressure.csv',
      headers,
      teamInsights.categoryPressure.map(d => [d.category, d.totalBudget, d.totalProjected, d.overspendRatio, d.overBudgetCount]),
    )
  }

  const exportAllCsv = () => {
    exportCohortCsv()
    exportCashFlowCsv()
    exportCategoryCsv()
    exportCategoryPressureCsv()
  }

  return (
    <RouteGuard allowedRoles={['manager', 'fa']}>
      <AdminHeader title="Analytics" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">PFMS Analytics</h1>
              <p className="text-muted-foreground">
                Budget adherence, category pressure, and weekly cash movement across your visible customers.
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                  <Download className="size-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Download CSV</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportCohortCsv}>Cohort Summary</DropdownMenuItem>
                <DropdownMenuItem onClick={exportCashFlowCsv}>Cash Flow</DropdownMenuItem>
                <DropdownMenuItem onClick={exportCategoryCsv}>Category Spending</DropdownMenuItem>
                <DropdownMenuItem onClick={exportCategoryPressureCsv}>Category Pressure</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportAllCsv} className="font-medium">
                  Export All (4 files)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ── Filter toolbar ─────────────────────────────────────────────── */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
                <Filter className="size-3.5" />
                Filters
              </div>
              <Separator orientation="vertical" className="h-5 hidden sm:block" />

              <div className="flex items-center gap-2 flex-wrap">
                <Select value={riskTierFilter} onValueChange={setRiskTierFilter}>
                  <SelectTrigger className="h-8 w-[160px] text-sm bg-background">
                    <SelectValue placeholder="Risk tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All risk tiers</SelectItem>
                    {teamInsights.riskCohorts.map(c => (
                      <SelectItem key={c.label} value={c.label}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={advisorFilter} onValueChange={setAdvisorFilter}>
                  <SelectTrigger className="h-8 w-[190px] text-sm bg-background">
                    <SelectValue placeholder="Advisor team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All advisor teams</SelectItem>
                    {teamInsights.advisorTeams.map(t => (
                      <SelectItem key={t.label} value={t.label}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={categoryLimit} onValueChange={v => setCategoryLimit(v as typeof categoryLimit)}>
                  <SelectTrigger className="h-8 w-[150px] text-sm bg-background">
                    <SelectValue placeholder="Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Top 5 categories</SelectItem>
                    <SelectItem value="10">Top 10 categories</SelectItem>
                    <SelectItem value="all">All categories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator orientation="vertical" className="h-5 hidden sm:block" />

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Period:</span>
                  <ToggleGroup
                    type="single"
                    value={cashFlowPeriod}
                    onValueChange={v => v && setCashFlowPeriod(v as typeof cashFlowPeriod)}
                    className="h-8"
                  >
                    <ToggleGroupItem value="3m" className="h-7 px-2.5 text-xs">3M</ToggleGroupItem>
                    <ToggleGroupItem value="6m" className="h-7 px-2.5 text-xs">6M</ToggleGroupItem>
                    <ToggleGroupItem value="all" className="h-7 px-2.5 text-xs">All</ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Flow chart:</span>
                  <ToggleGroup
                    type="single"
                    value={cashFlowChartType}
                    onValueChange={v => v && setCashFlowChartType(v as 'bar' | 'line')}
                    className="h-8"
                  >
                    <ToggleGroupItem value="bar" className="h-7 w-7 p-0">
                      <BarChart2 className="size-3.5" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="line" className="h-7 w-7 p-0">
                      <LineChartIcon className="size-3.5" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Category chart:</span>
                  <ToggleGroup
                    type="single"
                    value={categoryChartType}
                    onValueChange={v => v && setCategoryChartType(v as 'bar' | 'line')}
                    className="h-8"
                  >
                    <ToggleGroupItem value="bar" className="h-7 w-7 p-0">
                      <BarChart2 className="size-3.5" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="line" className="h-7 w-7 p-0">
                      <LineChartIcon className="size-3.5" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>

              {(riskTierFilter !== 'all' || advisorFilter !== 'all' || cashFlowPeriod !== 'all' || categoryLimit !== '5') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs ml-auto text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setRiskTierFilter('all')
                    setAdvisorFilter('all')
                    setCashFlowPeriod('all')
                    setCategoryLimit('5')
                  }}
                >
                  Reset filters
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Visible Customers</p>
                    <p className="text-xl font-bold tabular-nums">{visibleClients.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-chart-2/10">
                    <DollarSign className="size-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weekly Budget Total</p>
                    <p className="text-xl font-bold tabular-nums">{formatCurrency(totalWeeklyBudget)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-success/10">
                    <TrendingUp className="size-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget Usage</p>
                    <p className="text-xl font-bold tabular-nums text-success">{formatPercentage(budgetUsage)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-warning/10">
                    <AlertTriangle className="size-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Over Pace</p>
                    <p className="text-xl font-bold tabular-nums">{customersOverPace}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle>Cash Movement by Month</CardTitle>
                  <CardDescription>Completed inflow vs outflow from visible transactions.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground" onClick={exportCashFlowCsv}>
                  <Download className="size-3.5" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {cashFlowChartType === 'bar' ? (
                      <BarChart data={filteredCashFlowData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={value => `£${Math.round(value / 1000)}k`}
                          className="text-xs text-muted-foreground"
                          width={50}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || payload.length === 0) return null
                            return (
                              <div className="rounded-lg border bg-card p-3 shadow-md">
                                <p className="text-sm font-medium mb-2">{label}</p>
                                {payload.map((entry, index) => (
                                  <p key={index} className="text-sm" style={{ color: entry.color }}>
                                    {entry.name}: {formatCurrency(entry.value as number)}
                                  </p>
                                ))}
                              </div>
                            )
                          }}
                        />
                        <Legend />
                        <Bar dataKey="inflow" name="Inflow" fill="var(--success)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="outflow" name="Outflow" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <LineChart data={filteredCashFlowData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={value => `£${Math.round(value / 1000)}k`}
                          className="text-xs text-muted-foreground"
                          width={50}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || payload.length === 0) return null
                            return (
                              <div className="rounded-lg border bg-card p-3 shadow-md">
                                <p className="text-sm font-medium mb-2">{label}</p>
                                {payload.map((entry, index) => (
                                  <p key={index} className="text-sm" style={{ color: entry.color }}>
                                    {entry.name}: {formatCurrency(entry.value as number)}
                                  </p>
                                ))}
                              </div>
                            )
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="inflow" name="Inflow" stroke="var(--success)" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="outflow" name="Outflow" stroke="var(--destructive)" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle>Top Spend Categories</CardTitle>
                  <CardDescription>Where spending is concentrated this week.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground" onClick={exportCategoryCsv}>
                  <Download className="size-3.5" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {categoryChartType === 'bar' ? (
                      <BarChart data={filteredCategoryData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                        <XAxis
                          type="number"
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={value => `£${Math.round(value)}`}
                          className="text-xs text-muted-foreground"
                          width={50}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tickLine={false}
                          axisLine={false}
                          className="text-xs text-muted-foreground"
                          width={100}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || payload.length === 0) return null
                            return (
                              <div className="rounded-lg border bg-card p-3 shadow-md">
                                <p className="text-sm font-medium mb-2">{label}</p>
                                <p className="text-sm text-primary">Spent: {formatCurrency(payload[0].value as number)}</p>
                              </div>
                            )
                          }}
                        />
                        <Bar dataKey="spent" name="Spent" radius={[0, 4, 4, 0]}>
                          {filteredCategoryData.map((_, index) => (
                            <Cell key={index} fill={BAR_RANGE_COLORS[index % BAR_RANGE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <LineChart data={filteredCategoryData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={value => `£${Math.round(value)}`}
                          className="text-xs text-muted-foreground"
                          width={50}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || payload.length === 0) return null
                            return (
                              <div className="rounded-lg border bg-card p-3 shadow-md">
                                <p className="text-sm font-medium mb-2">{label}</p>
                                <p className="text-sm text-primary">Spent: {formatCurrency(payload[0].value as number)}</p>
                              </div>
                            )
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="spent"
                          name="Spent"
                          stroke="var(--primary)"
                          strokeWidth={2}
                          dot={{ fill: 'var(--primary)' }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Budget Outlook</CardTitle>
              <CardDescription>Projected spending against configured weekly budgets.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Spent So Far</p>
                <p className="text-2xl font-bold tabular-nums">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Projected Week End</p>
                <p className="text-2xl font-bold tabular-nums">{formatCurrency(totalProjected)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Remaining Headroom</p>
                <p className="text-2xl font-bold tabular-nums">{formatCurrency(totalWeeklyBudget - totalProjected)}</p>
              </div>
            </CardContent>
          </Card>

          {/* ── Anonymised Team-Level Insights ─────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Team Insights</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Anonymised, aggregated patterns across your visible client base. No individual is identified.
                </p>
              </div>
              <Badge variant="outline" className="text-xs gap-1.5">
                <ShieldCheck className="size-3" />
                Anonymised data
              </Badge>
            </div>

            {/* KPI row */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      <Users className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clients Analysed</p>
                      <p className="text-xl font-bold tabular-nums">{teamInsights.totalClientsAnalysed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-full ${teamInsights.overallOnTrackPct >= 60 ? 'bg-success/10' : 'bg-warning/10'}`}>
                      <ShieldCheck className={`size-5 ${teamInsights.overallOnTrackPct >= 60 ? 'text-success' : 'text-warning'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">On Track This Week</p>
                      <p className={`text-xl font-bold tabular-nums ${teamInsights.overallOnTrackPct >= 60 ? 'text-success' : 'text-warning'}`}>
                        {teamInsights.overallOnTrackPct}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                      <AlertTriangle className="size-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Top Pressure Category</p>
                      <p className="text-xl font-bold tabular-nums truncate">{teamInsights.topPressureCategory}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts row 1: advisor team comparison + risk cohort adherence */}
            <div className="grid gap-6 lg:grid-cols-2 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle>Budget Adherence by Advisor Team</CardTitle>
                    <CardDescription>
                      % of clients projected on or under budget. Teams anonymised to cohort labels.
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground" onClick={exportCohortCsv}>
                    <Download className="size-3.5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredAdvisorTeams} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          tickFormatter={v => `${v}%`}
                          tickLine={false}
                          axisLine={false}
                          className="text-xs text-muted-foreground"
                        />
                        <YAxis
                          dataKey="label"
                          type="category"
                          tickLine={false}
                          axisLine={false}
                          width={130}
                          className="text-xs text-muted-foreground"
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || payload.length === 0) return null
                            const d = payload[0].payload as typeof teamInsights.advisorTeams[0]
                            return (
                              <div className="rounded-lg border bg-card p-3 shadow-md text-sm space-y-1">
                                <p className="font-medium">{d.label}</p>
                                <p className="text-muted-foreground">{d.onTrackCount} of {d.clientCount} clients on track</p>
                                <p>Budget: {formatCurrency(d.totalBudget)} | Projected: {formatCurrency(d.totalProjected)}</p>
                                <p>Avg income utilisation: {d.avgIncomeUtilisation}%</p>
                              </div>
                            )
                          }}
                        />
                        <Bar dataKey="onTrackPct" name="On Track %" radius={[0, 4, 4, 0]}>
                          {filteredAdvisorTeams.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.onTrackPct >= 60 ? 'var(--success)' : 'var(--warning)'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle>Budget Adherence by Risk Tier</CardTitle>
                    <CardDescription>
                      On-track percentage grouped by client risk profile.
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground" onClick={exportCohortCsv}>
                    <Download className="size-3.5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredRiskCohorts}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                        <YAxis
                          domain={[0, 100]}
                          tickFormatter={v => `${v}%`}
                          tickLine={false}
                          axisLine={false}
                          className="text-xs text-muted-foreground"
                          width={42}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || payload.length === 0) return null
                            const d = payload[0].payload as typeof teamInsights.riskCohorts[0]
                            return (
                              <div className="rounded-lg border bg-card p-3 shadow-md text-sm space-y-1">
                                <p className="font-medium">{d.label}</p>
                                <p className="text-muted-foreground">{d.onTrackCount} of {d.clientCount} on track</p>
                                <p>Budget: {formatCurrency(d.totalBudget)} | Projected: {formatCurrency(d.totalProjected)}</p>
                              </div>
                            )
                          }}
                        />
                        <Bar dataKey="onTrackPct" name="On Track %" radius={[4, 4, 0, 0]}>
                          {filteredRiskCohorts.map((_, index) => (
                            <Cell key={index} fill={BAR_RANGE_COLORS[index % BAR_RANGE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts row 2: category pressure + 6-week trend */}
            <div className="grid gap-6 lg:grid-cols-2 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Pressure Index</CardTitle>
                  <CardDescription>
                    Projected overspend ratio per category across all visible clients. Positive = over budget.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={teamInsights.categoryPressure} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                        <XAxis
                          type="number"
                          tickFormatter={v => `${v}%`}
                          tickLine={false}
                          axisLine={false}
                          className="text-xs text-muted-foreground"
                        />
                        <YAxis
                          dataKey="category"
                          type="category"
                          tickLine={false}
                          axisLine={false}
                          width={130}
                          className="text-xs text-muted-foreground"
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || payload.length === 0) return null
                            const d = payload[0].payload as typeof teamInsights.categoryPressure[0]
                            return (
                              <div className="rounded-lg border bg-card p-3 shadow-md text-sm space-y-1">
                                <p className="font-medium">{d.category}</p>
                                <p>Budget: {formatCurrency(d.totalBudget)}</p>
                                <p>Projected: {formatCurrency(d.totalProjected)}</p>
                                <p className={d.overspendRatio > 0 ? 'text-destructive' : 'text-success'}>
                                  {d.overspendRatio > 0 ? '+' : ''}{d.overspendRatio}% vs budget
                                </p>
                                <p className="text-muted-foreground">{d.overBudgetCount} client(s) over cap</p>
                              </div>
                            )
                          }}
                        />
                        <Bar dataKey="overspendRatio" name="Overspend %" radius={[0, 4, 4, 0]}>
                          {teamInsights.categoryPressure.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.overspendRatio > 0 ? 'var(--destructive)' : 'var(--success)'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Budget Health (6 Weeks)</CardTitle>
                  <CardDescription>
                    Percentage of clients on track per advisor team and overall — week by week.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={teamInsights.healthTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                        <XAxis dataKey="weekLabel" tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                        <YAxis
                          domain={[0, 100]}
                          tickFormatter={v => `${v}%`}
                          tickLine={false}
                          axisLine={false}
                          className="text-xs text-muted-foreground"
                          width={42}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || payload.length === 0) return null
                            return (
                              <div className="rounded-lg border bg-card p-3 shadow-md text-sm space-y-1">
                                <p className="font-medium">{label}</p>
                                {payload.map((entry, i) => (
                                  <p key={i} style={{ color: entry.color }}>{entry.name}: {entry.value}%</p>
                                ))}
                              </div>
                            )
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="adv001Pct" name="J. Wilson Team" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="adv002Pct" name="E. Rodriguez Team" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="overallPct" name="Overall" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cohort detail table */}
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="size-4" />
                    Cohort Summary Table
                  </CardTitle>
                  <CardDescription>
                    Aggregated budget metrics per advisor team. Client identities are not disclosed.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground" onClick={exportCohortCsv}>
                  <Download className="size-3.5" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="pb-2 text-left font-medium">Cohort</th>
                        <th className="pb-2 text-right font-medium">Clients</th>
                        <th className="pb-2 text-right font-medium">On Track</th>
                        <th className="pb-2 text-right font-medium">Total Budget</th>
                        <th className="pb-2 text-right font-medium">Projected</th>
                        <th className="pb-2 text-right font-medium">Income Utilisation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...filteredAdvisorTeams, ...filteredRiskCohorts].map((cohort, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2.5 font-medium">{cohort.label}</td>
                          <td className="py-2.5 text-right tabular-nums">{cohort.clientCount}</td>
                          <td className="py-2.5 text-right tabular-nums">
                            <span className={cohort.onTrackPct >= 60 ? 'text-success' : 'text-warning'}>
                              {cohort.onTrackPct}%
                            </span>
                          </td>
                          <td className="py-2.5 text-right tabular-nums">{formatCurrency(cohort.totalBudget)}</td>
                          <td className="py-2.5 text-right tabular-nums">
                            <span className={cohort.totalProjected > cohort.totalBudget ? 'text-destructive' : ''}>
                              {formatCurrency(cohort.totalProjected)}
                            </span>
                          </td>
                          <td className="py-2.5 text-right tabular-nums">{cohort.avgIncomeUtilisation}%</td>
                        </tr>
                      ))}
                      {[...filteredAdvisorTeams, ...filteredRiskCohorts].length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-muted-foreground text-sm">
                            No cohorts match the current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </RouteGuard>
  )
}

