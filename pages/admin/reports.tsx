'use client'

import { useMemo, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChevronDown, Download, FileText, ImageDown, Users } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { PrivacyNotice } from '@/components/admin/privacy-notice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUserRole } from '@/hooks/use-user-role'
import { useUserTransactions, readConsentSync } from '@/hooks/use-store'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'
import { mockPortfolios } from '@/lib/data/mock-portfolios'
import { getVisibleClients, getVisibleTransactions } from '@/lib/utils/role-filters'
import { exportChart, exportData } from '@/lib/utils/export'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Unified personalised report page (SRD-U06, SRD-A03) wired into the
 * shared export utility (SRD-G06). Behaviour adapts to the active role.
 */
export default function ReportsPage() {
  const { user } = useUserRole()

  if (user.role === 'customer') {
    return <CustomerReports clientId={user.clientId ?? 'CLT001'} />
  }

  return <AdvisorReports />
}

// --- Customer report (SRD-U06) ------------------------------------------------

function CustomerReports({ clientId }: { clientId: string }) {
  const snapshot = useMemo(() => getPFMSSnapshotForCustomer(clientId), [clientId])
  const { transactions } = useUserTransactions(clientId)
  const categoryChartRef = useRef<HTMLDivElement>(null)
  const trendChartRef = useRef<HTMLDivElement>(null)

  const categoryRows = snapshot.categories.map(category => ({
    label: category.label,
    spent: category.spent,
    weeklyBudget: category.weeklyBudget,
    projected: category.projectedSpend,
    headroom: category.weeklyBudget - category.projectedSpend,
  }))

  // Spending trend by day -- combine snapshot recent + user transactions
  const trendMap = new Map<string, number>()
  ;[...snapshot.recentTransactions, ...transactions].forEach(item => {
    const day = new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    trendMap.set(day, (trendMap.get(day) ?? 0) + item.amount)
  })
  const trendRows = Array.from(trendMap.entries())
    .map(([day, total]) => ({ day, total }))
    .sort((a, b) => (a.day < b.day ? -1 : 1))

  function exportCategoryReport() {
    exportData({
      filename: `my-budget-report-${new Date().toISOString().slice(0, 10)}`,
      rows: categoryRows,
      columns: [
        { key: 'label', label: 'Category' },
        { key: 'weeklyBudget', label: 'Weekly Budget' },
        { key: 'spent', label: 'Spent' },
        { key: 'projected', label: 'Projected' },
        { key: 'headroom', label: 'Headroom' },
      ],
    })
  }

  function exportTrendReport() {
    exportData({
      filename: `my-spending-trend-${new Date().toISOString().slice(0, 10)}`,
      rows: trendRows,
      columns: [
        { key: 'day', label: 'Day' },
        { key: 'total', label: 'Spend (GBP)' },
      ],
    })
  }

  function exportCategoryReportPdf() {
    exportData({
      filename: `my-budget-report-${new Date().toISOString().slice(0, 10)}`,
      format: 'pdf',
      rows: categoryRows,
      columns: [
        { key: 'label', label: 'Category' },
        { key: 'weeklyBudget', label: 'Weekly Budget' },
        { key: 'spent', label: 'Spent' },
        { key: 'projected', label: 'Projected' },
        { key: 'headroom', label: 'Headroom' },
      ],
    })
  }

  function exportTrendReportPdf() {
    exportData({
      filename: `my-spending-trend-${new Date().toISOString().slice(0, 10)}`,
      format: 'pdf',
      rows: trendRows,
      columns: [
        { key: 'day', label: 'Day' },
        { key: 'total', label: 'Spend (GBP)' },
      ],
    })
  }

  function exportCategoryChart() {
    if (categoryChartRef.current)
      exportChart({ element: categoryChartRef.current, filename: `my-budget-chart-${new Date().toISOString().slice(0, 10)}` })
  }

  function exportTrendChart() {
    if (trendChartRef.current)
      exportChart({ element: trendChartRef.current, filename: `my-spending-trend-chart-${new Date().toISOString().slice(0, 10)}` })
  }

  return (
    <>
      <AdminHeader title="My Reports" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Personal Reports</h1>
              <p className="text-muted-foreground">
                Personalised financial reports and spending trends for your records.
              </p>
            </div>
          </div>

          <PrivacyNotice />

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <CardTitle>Budget vs. Spend by Category</CardTitle>
                <CardDescription>{snapshot.weekLabel}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 size-4" />
                    Export
                    <ChevronDown className="ml-1 size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportCategoryReport}>
                    <Download className="mr-2 size-4" />
                    Export Data (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportCategoryReportPdf}>
                    <FileText className="mr-2 size-4" />
                    Export Data (PDF)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportCategoryChart}>
                    <ImageDown className="mr-2 size-4" />
                    Export Chart (PNG)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div ref={categoryChartRef} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryRows}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={value => `\u00a3${value}`}
                      className="text-xs"
                      width={50}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        return (
                          <div className="rounded-lg border bg-card p-3 shadow-md">
                            <p className="text-sm font-medium mb-1">{label}</p>
                            {payload.map((entry, i) => (
                              <p key={i} className="text-xs" style={{ color: entry.color }}>
                                {entry.name}: {formatCurrency(entry.value as number)}
                              </p>
                            ))}
                          </div>
                        )
                      }}
                    />
                    <Bar dataKey="weeklyBudget" name="Budget" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spent" name="Spent" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="projected" name="Projected" fill="var(--warning)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <CardTitle>Spending Trend</CardTitle>
                <CardDescription>Daily total across recent transactions.</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={trendRows.length === 0}>
                    <Download className="mr-2 size-4" />
                    Export
                    <ChevronDown className="ml-1 size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportTrendReport}>
                    <Download className="mr-2 size-4" />
                    Export Data (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportTrendReportPdf}>
                    <FileText className="mr-2 size-4" />
                    Export Data (PDF)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportTrendChart}>
                    <ImageDown className="mr-2 size-4" />
                    Export Chart (PNG)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div ref={trendChartRef} className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendRows}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={value => `\u00a3${value}`}
                      className="text-xs"
                      width={50}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Spend"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--primary)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

// --- Advisor / manager report (SRD-A03) ---------------------------------------

function AdvisorReports() {
  const { user } = useUserRole()
  const visibleClients = useMemo(() => getVisibleClients(user), [user])
  const visibleTransactions = useMemo(() => getVisibleTransactions(user), [user])
  const budgetChartRef = useRef<HTMLDivElement>(null)
  const portfolioChartRef = useRef<HTMLDivElement>(null)
  const allocationChartRef = useRef<HTMLDivElement>(null)
  const historyChartRef = useRef<HTMLDivElement>(null)
  const [selectedClientId, setSelectedClientId] = useState<string>(
    visibleClients[0]?.id ?? '',
  )

  const selectedClient = visibleClients.find(client => client.id === selectedClientId)

  const consent =
    user.role === 'fa' && selectedClient ? readConsentSync(selectedClient.id) : null

  const canViewClientSummary =
    user.role === 'manager' || (consent ? consent.shareWithAdvisor && consent.shareSpending : false)

  const snapshot = selectedClient ? getPFMSSnapshotForCustomer(selectedClient.id) : null
  const portfolio = selectedClient ? (mockPortfolios[selectedClient.id] ?? null) : null
  const clientTxns = useMemo(
    () => visibleTransactions.filter(txn => txn.clientId === selectedClientId),
    [visibleTransactions, selectedClientId],
  )

  const categoryRows = snapshot
    ? snapshot.categories.map(category => ({
        label: category.label,
        spent: category.spent,
        weeklyBudget: category.weeklyBudget,
        projected: category.projectedSpend,
      }))
    : []

  // Derive 6-month portfolio value time series from yearly return
  const portfolioTimeSeries = useMemo(() => {
    if (!portfolio) return []
    const yearlyReturn = portfolio.performance.yearly / 100
    const monthlyRate = (1 + yearlyReturn) ** (1 / 12) - 1
    const currentValue = portfolio.totalValue
    const MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan']
    return MONTHS.map((month, i) => {
      const periodsFromEnd = MONTHS.length - 1 - i
      const value = Math.round(currentValue / (1 + monthlyRate) ** periodsFromEnd)
      return { month, value }
    })
  }, [portfolio])

  // Asset allocation grouped by type from current holdings
  const assetAllocation = useMemo(() => {
    if (!portfolio) return []
    const byType = new Map<string, number>()
    portfolio.holdings.forEach(h => {
      const label =
        h.type === 'real-estate'
          ? 'Real Estate'
          : h.type.charAt(0).toUpperCase() + h.type.slice(1)
      byType.set(label, (byType.get(label) ?? 0) + h.allocation)
    })
    const COLORS = [
      'var(--chart-1)',
      'var(--chart-2)',
      'var(--chart-3)',
      'var(--chart-4)',
      'var(--chart-5)',
    ]
    return Array.from(byType.entries()).map(([name, value], i) => ({
      name,
      value: Math.round(value * 10) / 10,
      fill: COLORS[i % COLORS.length],
    }))
  }, [portfolio])

  // Weekly total spending from PFMS history
  const historyRows = useMemo(() => {
    if (!snapshot?.history?.length) return []
    return snapshot.history.map(week => ({
      week: week.weekLabel,
      total:
        Math.round(
          Object.values(week.categories).reduce((s, c) => s + c.spent, 0) * 100,
        ) / 100,
    }))
  }, [snapshot])

  function exportClientReport() {
    if (!snapshot || !selectedClient) return
    exportData({
      filename: `client-report-${selectedClient.id}-${new Date().toISOString().slice(0, 10)}`,
      rows: categoryRows,
      columns: [
        { key: 'label', label: 'Category' },
        { key: 'weeklyBudget', label: 'Weekly Budget' },
        { key: 'spent', label: 'Spent' },
        { key: 'projected', label: 'Projected' },
      ],
    })
  }

  function exportClientReportPdf() {
    if (!snapshot || !selectedClient) return
    exportData({
      filename: `client-report-${selectedClient.id}-${new Date().toISOString().slice(0, 10)}`,
      format: 'pdf',
      rows: categoryRows,
      columns: [
        { key: 'label', label: 'Category' },
        { key: 'weeklyBudget', label: 'Weekly Budget' },
        { key: 'spent', label: 'Spent' },
        { key: 'projected', label: 'Projected' },
      ],
    })
  }

  function exportBudgetChart() {
    if (budgetChartRef.current && selectedClient)
      exportChart({
        element: budgetChartRef.current,
        filename: `client-budget-chart-${selectedClient.id}-${new Date().toISOString().slice(0, 10)}`,
      })
  }

  function exportTransactionsReport() {
    exportData({
      filename: `client-transactions-${selectedClientId}-${new Date().toISOString().slice(0, 10)}`,
      rows: clientTxns,
      columns: [
        { key: 'date', label: 'Date', value: (row: typeof clientTxns[0]) => formatDate(row.date) },
        { key: 'type', label: 'Type' },
        { key: 'description', label: 'Description', value: (row: typeof clientTxns[0]) => row.description ?? '' },
        { key: 'amount', label: 'Amount' },
        { key: 'status', label: 'Status' },
      ],
    })
  }

  function exportTransactionsReportPdf() {
    exportData({
      filename: `client-transactions-${selectedClientId}-${new Date().toISOString().slice(0, 10)}`,
      format: 'pdf',
      rows: clientTxns,
      columns: [
        { key: 'date', label: 'Date', value: (row: typeof clientTxns[0]) => formatDate(row.date) },
        { key: 'type', label: 'Type' },
        { key: 'description', label: 'Description', value: (row: typeof clientTxns[0]) => row.description ?? '' },
        { key: 'amount', label: 'Amount' },
        { key: 'status', label: 'Status' },
      ],
    })
  }

  function exportHoldingsReport() {
    if (!portfolio || !selectedClient) return
    exportData({
      filename: `holdings-${selectedClient.id}-${new Date().toISOString().slice(0, 10)}`,
      rows: portfolio.holdings,
      columns: [
        { key: 'asset', label: 'Asset' },
        { key: 'ticker', label: 'Ticker', value: (row: typeof portfolio.holdings[0]) => row.ticker ?? '--' },
        { key: 'type', label: 'Type' },
        { key: 'value', label: 'Value (USD)' },
        { key: 'allocation', label: 'Allocation %' },
        { key: 'change', label: 'YTD Change %' },
      ],
    })
  }

  function exportHoldingsReportPdf() {
    if (!portfolio || !selectedClient) return
    exportData({
      filename: `holdings-${selectedClient.id}-${new Date().toISOString().slice(0, 10)}`,
      format: 'pdf',
      rows: portfolio.holdings,
      columns: [
        { key: 'asset', label: 'Asset' },
        { key: 'ticker', label: 'Ticker', value: (row: typeof portfolio.holdings[0]) => row.ticker ?? '--' },
        { key: 'type', label: 'Type' },
        { key: 'value', label: 'Value (USD)' },
        { key: 'allocation', label: 'Allocation %' },
        { key: 'change', label: 'YTD Change %' },
      ],
    })
  }

  function exportPortfolioChart() {
    if (portfolioChartRef.current && selectedClient)
      exportChart({
        element: portfolioChartRef.current,
        filename: `portfolio-chart-${selectedClient.id}-${new Date().toISOString().slice(0, 10)}`,
      })
  }

  function exportAllocationChart() {
    if (allocationChartRef.current && selectedClient)
      exportChart({
        element: allocationChartRef.current,
        filename: `allocation-chart-${selectedClient.id}-${new Date().toISOString().slice(0, 10)}`,
      })
  }

  function exportHistoryChart() {
    if (historyChartRef.current && selectedClient)
      exportChart({
        element: historyChartRef.current,
        filename: `spending-history-${selectedClient.id}-${new Date().toISOString().slice(0, 10)}`,
      })
  }

  function exportHistoryReport() {
    if (!historyRows.length || !selectedClient) return
    exportData({
      filename: `spending-history-${selectedClient.id}-${new Date().toISOString().slice(0, 10)}`,
      rows: historyRows,
      columns: [
        { key: 'week', label: 'Week' },
        { key: 'total', label: 'Total Spend (GBP)' },
      ],
    })
  }

  return (
    <>
      <AdminHeader title="Reports" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Page header + client selector */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Client Reports</h1>
              <p className="text-muted-foreground">
                {user.role === 'manager'
                  ? 'Generate personalised financial reports for any client.'
                  : 'Generate personalised reports for clients who have shared their data with you.'}
              </p>
            </div>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Choose a client" />
              </SelectTrigger>
              <SelectContent>
                {visibleClients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    <span className="flex items-center gap-2">
                      <Users className="size-3.5 text-muted-foreground" />
                      {client.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Portfolio section -- always visible to advisers */}
          {portfolio && selectedClient && (
            <>
              {/* Portfolio stat cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Portfolio Value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className={portfolio.performance.daily >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {portfolio.performance.daily >= 0 ? '+' : ''}{portfolio.performance.daily}% today
                      </span>
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Risk Profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">{selectedClient.riskLevel}</div>
                    <p className="text-xs text-muted-foreground mt-1">Assigned risk category</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Monthly Return</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={cn('text-2xl font-bold', portfolio.performance.monthly >= 0 ? 'text-green-600' : 'text-red-600')}>
                      {portfolio.performance.monthly >= 0 ? '+' : ''}{portfolio.performance.monthly}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Yearly: {portfolio.performance.yearly >= 0 ? '+' : ''}{portfolio.performance.yearly}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Holdings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{portfolio.holdings.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Across {assetAllocation.length} asset classes
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Portfolio performance area chart */}
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <CardTitle>Portfolio Performance &mdash; {selectedClient.name}</CardTitle>
                    <CardDescription>Estimated 6-month trajectory based on current return rate</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={exportPortfolioChart}>
                    <ImageDown className="mr-2 size-4" />
                    Export Chart
                  </Button>
                </CardHeader>
                <CardContent>
                  <div ref={portfolioChartRef} className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={portfolioTimeSeries}>
                        <defs>
                          <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={value => formatCurrency(value, true)}
                          className="text-xs"
                          width={72}
                        />
                        <Tooltip formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="var(--primary)"
                          strokeWidth={2}
                          fill="url(#portfolioGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Asset allocation + holdings */}
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <CardTitle>Asset Allocation</CardTitle>
                      <CardDescription>By asset class (% of portfolio)</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={exportAllocationChart}>
                      <ImageDown className="mr-2 size-4" />
                      Export Chart
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div ref={allocationChartRef} className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={assetAllocation}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                          >
                            {assetAllocation.map((entry, i) => (
                              <Cell key={`cell-${i}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [`${value}%`, 'Allocation']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <CardTitle>Holdings</CardTitle>
                      <CardDescription>{portfolio.holdings.length} position(s)</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 size-4" />
                          Export
                          <ChevronDown className="ml-1 size-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={exportHoldingsReport}>
                          <Download className="mr-2 size-4" />
                          Export Data (CSV)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={exportHoldingsReportPdf}>
                          <FileText className="mr-2 size-4" />
                          Export Data (PDF)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[262px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-card">
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Asset</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Value</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Alloc.</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">YTD</th>
                          </tr>
                        </thead>
                        <tbody>
                          {portfolio.holdings.map((holding, i) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="px-4 py-2">
                                <div className="font-medium text-xs">{holding.asset}</div>
                                {holding.ticker && (
                                  <div className="text-[11px] text-muted-foreground">{holding.ticker} &middot; {holding.type}</div>
                                )}
                              </td>
                              <td className="px-4 py-2 text-right text-xs">{formatCurrency(holding.value, true)}</td>
                              <td className="px-4 py-2 text-right text-xs">{holding.allocation}%</td>
                              <td className={cn(
                                'px-4 py-2 text-right text-xs font-medium',
                                holding.change > 0 ? 'text-green-600' : holding.change < 0 ? 'text-red-600' : 'text-muted-foreground',
                              )}>
                                {holding.change > 0 ? '+' : ''}{holding.change}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Consent notice for FA role */}
          {!canViewClientSummary && selectedClient && (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground space-y-2">
                <p>
                  <FileText className="inline size-4 mr-1 text-muted-foreground" />
                  {selectedClient.name} has not shared their financial summary with you.
                </p>
                <p className="text-xs">
                  Ask the client to enable sharing in their Privacy &amp; Sharing settings.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Consent-gated PFMS sections */}
          {canViewClientSummary && snapshot && (
            <>
              {user.role === 'fa' && (
                <Badge variant="outline" className="text-xs">
                  Viewing with client consent &mdash; last updated{' '}
                  {consent && consent.updatedAt
                    ? formatDate(consent.updatedAt)
                    : 'unknown'}
                </Badge>
              )}

              {/* Budget snapshot */}
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <CardTitle>Budget Snapshot &mdash; {selectedClient?.name}</CardTitle>
                    <CardDescription>{snapshot.weekLabel}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 size-4" />
                        Export
                        <ChevronDown className="ml-1 size-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={exportClientReport}>
                        <Download className="mr-2 size-4" />
                        Export Data (CSV)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportClientReportPdf}>
                        <FileText className="mr-2 size-4" />
                        Export Data (PDF)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={exportBudgetChart}>
                        <ImageDown className="mr-2 size-4" />
                        Export Chart (PNG)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div ref={budgetChartRef} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryRows}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} className="text-xs" />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={value => `\u00a3${value}`}
                          className="text-xs"
                          width={50}
                        />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="weeklyBudget" name="Budget" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="spent" name="Spent" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="projected" name="Projected" fill="var(--warning)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Spending history trend */}
              {historyRows.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <CardTitle>Spending History &mdash; {selectedClient?.name}</CardTitle>
                      <CardDescription>Total weekly spend over the last 6 weeks</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 size-4" />
                          Export
                          <ChevronDown className="ml-1 size-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={exportHistoryReport}>
                          <Download className="mr-2 size-4" />
                          Export Data (CSV)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={exportHistoryChart}>
                          <ImageDown className="mr-2 size-4" />
                          Export Chart (PNG)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div ref={historyChartRef} className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historyRows}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                          <XAxis dataKey="week" tickLine={false} axisLine={false} className="text-xs" />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={value => `\u00a3${value}`}
                            className="text-xs"
                            width={50}
                          />
                          <Tooltip formatter={(value: number) => [`\u00a3${value}`, 'Weekly Spend']} />
                          <Line
                            type="monotone"
                            dataKey="total"
                            name="Weekly Spend"
                            stroke="var(--chart-2)"
                            strokeWidth={2}
                            dot={{ fill: 'var(--chart-2)' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transactions table */}
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>{clientTxns.length} record(s) on file</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={clientTxns.length === 0}>
                        <Download className="mr-2 size-4" />
                        Export
                        <ChevronDown className="ml-1 size-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={exportTransactionsReport}>
                        <Download className="mr-2 size-4" />
                        Export (CSV)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportTransactionsReportPdf}>
                        <FileText className="mr-2 size-4" />
                        Export (PDF)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                {clientTxns.length > 0 ? (
                  <CardContent className="p-0">
                    <div className="max-h-[320px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-card">
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clientTxns.map(txn => (
                            <tr key={txn.id} className="border-b last:border-0">
                              <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">{formatDate(txn.date)}</td>
                              <td className="px-4 py-2 text-xs capitalize">{txn.type}</td>
                              <td className="px-4 py-2 text-xs text-muted-foreground">{txn.description ?? '\u2014'}</td>
                              <td className={cn(
                                'px-4 py-2 text-right text-xs font-medium',
                                txn.type === 'deposit' || txn.type === 'dividend' ? 'text-green-600' : 'text-foreground',
                              )}>
                                {txn.type === 'deposit' || txn.type === 'dividend' ? '+' : ''}{formatCurrency(txn.amount)}
                              </td>
                              <td className="px-4 py-2 text-right">
                                <Badge
                                  variant={txn.status === 'completed' ? 'secondary' : txn.status === 'pending' ? 'outline' : 'destructive'}
                                  className="text-[10px]"
                                >
                                  {txn.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">No transactions on file for this client.</p>
                  </CardContent>
                )}
              </Card>
            </>
          )}
        </div>
      </main>
    </>
  )
}
