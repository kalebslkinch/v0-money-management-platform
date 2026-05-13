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
import { Download, FileText, Users } from 'lucide-react'
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
import { getVisibleClients, getVisibleTransactions } from '@/lib/utils/role-filters'
import { exportData } from '@/lib/utils/export'
import { formatCurrency, formatDate } from '@/lib/utils/format'

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

// ─── Customer report (SRD-U06) ────────────────────────────────────────────────

function CustomerReports({ clientId }: { clientId: string }) {
  const snapshot = useMemo(() => getPFMSSnapshotForCustomer(clientId), [clientId])
  const { transactions } = useUserTransactions(clientId)

  const categoryRows = snapshot.categories.map(category => ({
    label: category.label,
    spent: category.spent,
    weeklyBudget: category.weeklyBudget,
    projected: category.projectedSpend,
    headroom: category.weeklyBudget - category.projectedSpend,
  }))

  // Spending trend by day — combine snapshot recent + user transactions
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
              <Button variant="outline" size="sm" onClick={exportCategoryReport}>
                <Download className="mr-2 size-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryRows}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={value => `£${value}`}
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
                    <Bar dataKey="weeklyBudget" name="Budget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spent" name="Spent" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="projected" name="Projected" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
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
              <Button
                variant="outline"
                size="sm"
                onClick={exportTrendReport}
                disabled={trendRows.length === 0}
              >
                <Download className="mr-2 size-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendRows}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={value => `£${value}`}
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
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
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

// ─── Advisor / manager report (SRD-A03) ───────────────────────────────────────

function AdvisorReports() {
  const { user } = useUserRole()
  const visibleClients = useMemo(() => getVisibleClients(user), [user])
  const visibleTransactions = useMemo(() => getVisibleTransactions(user), [user])
  const [selectedClientId, setSelectedClientId] = useState<string>(
    visibleClients[0]?.id ?? '',
  )

  const selectedClient = visibleClients.find(client => client.id === selectedClientId)

  const consent =
    user.role === 'fa' && selectedClient ? readConsentSync(selectedClient.id) : null

  const canViewClientSummary =
    user.role === 'manager' || (consent ? consent.shareWithAdvisor && consent.shareSpending : false)

  const snapshot = selectedClient ? getPFMSSnapshotForCustomer(selectedClient.id) : null
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

  function exportTransactionsReport() {
    exportData({
      filename: `client-transactions-${selectedClientId}-${new Date().toISOString().slice(0, 10)}`,
      rows: clientTxns,
      columns: [
        { key: 'date', label: 'Date', value: row => formatDate(row.date) },
        { key: 'type', label: 'Type' },
        { key: 'description', label: 'Description', value: row => row.description ?? '' },
        { key: 'amount', label: 'Amount' },
        { key: 'status', label: 'Status' },
      ],
    })
  }

  return (
    <>
      <AdminHeader title="Reports" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
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

          {!canViewClientSummary && selectedClient && (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground space-y-2">
                <p>
                  <FileText className="inline size-4 mr-1 text-muted-foreground" />
                  {selectedClient.name} has not shared their financial summary with you.
                </p>
                <p className="text-xs">
                  Ask the client to enable sharing in their Privacy & Sharing settings.
                </p>
              </CardContent>
            </Card>
          )}

          {canViewClientSummary && snapshot && (
            <>
              {user.role === 'fa' && (
                <Badge variant="outline" className="text-xs">
                  Viewing with client consent — last updated{' '}
                  {consent && consent.updatedAt
                    ? formatDate(consent.updatedAt)
                    : 'unknown'}
                </Badge>
              )}

              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <CardTitle>Budget Snapshot — {selectedClient?.name}</CardTitle>
                    <CardDescription>{snapshot.weekLabel}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={exportClientReport}>
                    <Download className="mr-2 size-4" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryRows}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} className="text-xs" />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={value => `£${value}`}
                          className="text-xs"
                          width={50}
                        />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="weeklyBudget" name="Budget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="spent" name="Spent" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="projected" name="Projected" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>{clientTxns.length} record(s) on file</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportTransactionsReport}
                    disabled={clientTxns.length === 0}
                  >
                    <Download className="mr-2 size-4" />
                    Export
                  </Button>
                </CardHeader>
              </Card>
            </>
          )}
        </div>
      </main>
    </>
  )
}
