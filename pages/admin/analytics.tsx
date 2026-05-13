import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { AdminHeader } from '@/components/admin/admin-header'
import { RouteGuard } from '@/components/auth/route-guard'
import { useUserRole } from '@/hooks/use-user-role'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { revenueData, clientGrowthData, kpiData, riskDistributionData } from '@/lib/data/mock-analytics'
import { getVisibleClients, getVisibleTransactions } from '@/lib/utils/role-filters'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import { TrendingUp, TrendingDown, Users, DollarSign, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AnalyticsPage() {
  const { user } = useUserRole()

  const visibleClients = useMemo(() => getVisibleClients(user), [user])
  const visibleTransactions = useMemo(() => getVisibleTransactions(user), [user])

  const completedTransactions = useMemo(
    () => visibleTransactions.filter(txn => txn.status === 'completed'),
    [visibleTransactions],
  )

  const managerView = user.role === 'manager'
  const totalAUM = visibleClients.reduce((sum, client) => sum + client.portfolioValue, 0)
  const managedCashInflow = completedTransactions
    .filter(txn => txn.type === 'deposit' || txn.type === 'dividend')
    .reduce((sum, txn) => sum + txn.amount, 0)
  const managedCashOutflow = completedTransactions
    .filter(txn => txn.type === 'withdrawal' || txn.type === 'fee')
    .reduce((sum, txn) => sum + txn.amount, 0)
  const completionRate = visibleTransactions.length
    ? (completedTransactions.length / visibleTransactions.length) * 100
    : 0

  const roleRiskDistribution = useMemo(() => {
    if (managerView) return riskDistributionData

    const riskCount = {
      Low: visibleClients.filter(client => client.riskLevel === 'low').length,
      Moderate: visibleClients.filter(client => client.riskLevel === 'moderate').length,
      High: visibleClients.filter(client => client.riskLevel === 'high').length,
    }
    const totalVisibleClients = visibleClients.length || 1

    return [
      {
        level: 'Low',
        count: riskCount.Low,
        percentage: Math.round((riskCount.Low / totalVisibleClients) * 100),
      },
      {
        level: 'Moderate',
        count: riskCount.Moderate,
        percentage: Math.round((riskCount.Moderate / totalVisibleClients) * 100),
      },
      {
        level: 'High',
        count: riskCount.High,
        percentage: Math.round((riskCount.High / totalVisibleClients) * 100),
      },
    ]
  }, [managerView, visibleClients])

  const roleRevenueData = useMemo(() => {
    if (managerView) return revenueData

    const janFees = completedTransactions
      .filter(txn => txn.type === 'fee')
      .reduce((sum, txn) => sum + txn.amount, 0)
    const janCommissions = completedTransactions
      .filter(txn => txn.type === 'buy' || txn.type === 'sell')
      .reduce((sum, txn) => sum + txn.amount, 0)

    return [
      { month: 'Aug', revenue: 0, fees: 0, commissions: 0 },
      { month: 'Sep', revenue: 0, fees: 0, commissions: 0 },
      { month: 'Oct', revenue: 0, fees: 0, commissions: 0 },
      { month: 'Nov', revenue: 0, fees: 0, commissions: 0 },
      { month: 'Dec', revenue: 0, fees: 0, commissions: 0 },
      { month: 'Jan', revenue: janFees + janCommissions, fees: janFees, commissions: janCommissions },
    ]
  }, [completedTransactions, managerView])

  const roleGrowthData = useMemo(() => {
    if (managerView) return clientGrowthData

    const baseAUM = totalAUM
    const clientCount = visibleClients.length

    return [
      { month: 'Aug', clients: Math.max(0, clientCount - 2), aum: Math.round(baseAUM * 0.78) },
      { month: 'Sep', clients: Math.max(0, clientCount - 2), aum: Math.round(baseAUM * 0.82) },
      { month: 'Oct', clients: Math.max(0, clientCount - 1), aum: Math.round(baseAUM * 0.86) },
      { month: 'Nov', clients: Math.max(0, clientCount - 1), aum: Math.round(baseAUM * 0.9) },
      { month: 'Dec', clients: clientCount, aum: Math.round(baseAUM * 0.95) },
      { month: 'Jan', clients: clientCount, aum: baseAUM },
    ]
  }, [clientGrowthData, managerView, totalAUM, visibleClients.length])

  return (
    <RouteGuard allowedRoles={['manager', 'fa']}>
      <AdminHeader title="Analytics" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              {managerView
                ? 'Detailed insights into overall business performance and metrics.'
                : 'Insights for your assigned customers and managed activity.'}
            </p>
          </div>

          {/* KPI Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <DollarSign className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {managerView ? 'Total Revenue' : 'Managed Cash Inflow'}
                    </p>
                    <p className="text-xl font-bold tabular-nums">
                      {managerView
                        ? formatCurrency(revenueData.reduce((sum, d) => sum + d.revenue, 0))
                        : formatCurrency(managedCashInflow)}
                    </p>
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
                    <p className="text-sm text-muted-foreground">
                      {managerView ? 'Avg. Return' : 'Completion Rate'}
                    </p>
                    <p className="text-xl font-bold tabular-nums text-success">
                      {managerView ? formatPercentage(kpiData.avgReturn) : formatPercentage(completionRate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-chart-2/10">
                    <Users className="size-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {managerView ? 'Client Growth' : 'Assigned Customers'}
                    </p>
                    <p className="text-xl font-bold tabular-nums">
                      {managerView ? formatPercentage(kpiData.clientsChange) : visibleClients.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-warning/10">
                    <PieChart className="size-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {managerView ? 'AUM Growth' : 'Managed AUM'}
                    </p>
                    <p className="text-xl font-bold tabular-nums">
                      {managerView ? formatPercentage(kpiData.aumChange) : formatCurrency(totalAUM)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>
                  {managerView ? 'Monthly revenue by source' : 'Managed activity totals for assigned customers'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roleRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        className="text-xs text-muted-foreground"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value / 1000}K`}
                        className="text-xs text-muted-foreground"
                        width={50}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
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
                          }
                          return null
                        }}
                      />
                      <Legend />
                      <Bar dataKey="fees" name="Management Fees" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="commissions" name="Commissions" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Client & AUM Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Trends</CardTitle>
                <CardDescription>
                  {managerView ? 'Client count and AUM over time' : 'Assigned customer count and managed value trend'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={roleGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        className="text-xs text-muted-foreground"
                      />
                      <YAxis
                        yAxisId="left"
                        tickLine={false}
                        axisLine={false}
                        className="text-xs text-muted-foreground"
                        width={30}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value / 1000000}M`}
                        className="text-xs text-muted-foreground"
                        width={50}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-card p-3 shadow-md">
                                <p className="text-sm font-medium mb-2">{label}</p>
                                <p className="text-sm text-primary">
                                  Clients: {payload[0].value}
                                </p>
                                <p className="text-sm text-chart-2">
                                  AUM: {formatCurrency(payload[1].value as number)}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="clients"
                        name="Clients"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="aum"
                        name="AUM"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--chart-2))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Analysis */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Performance Summary</CardTitle>
                <CardDescription>
                  {managerView
                    ? 'Key metrics compared month-over-month'
                    : 'Assigned customer activity and cashflow signals'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1 p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      {managerView ? 'Revenue Growth' : 'Inflow vs Outflow'}
                    </p>
                    <p className={cn(
                      'text-2xl font-bold flex items-center gap-1',
                      managerView
                        ? (kpiData.revenueChange >= 0 ? 'text-success' : 'text-destructive')
                        : (managedCashInflow - managedCashOutflow >= 0 ? 'text-success' : 'text-destructive')
                    )}>
                      {(managerView ? kpiData.revenueChange : managedCashInflow - managedCashOutflow) >= 0 ? (
                        <TrendingUp className="size-5" />
                      ) : (
                        <TrendingDown className="size-5" />
                      )}
                      {managerView
                        ? formatPercentage(kpiData.revenueChange)
                        : formatCurrency(managedCashInflow - managedCashOutflow)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {managerView ? 'vs previous month' : 'net completed activity'}
                    </p>
                  </div>
                  <div className="space-y-1 p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      {managerView ? 'AUM Growth' : 'Completed Transactions'}
                    </p>
                    <p className={cn(
                      'text-2xl font-bold flex items-center gap-1',
                      managerView ? (kpiData.aumChange >= 0 ? 'text-success' : 'text-destructive') : 'text-primary'
                    )}>
                      {(managerView ? kpiData.aumChange : completedTransactions.length) >= 0 ? (
                        <TrendingUp className="size-5" />
                      ) : (
                        <TrendingDown className="size-5" />
                      )}
                      {managerView ? formatPercentage(kpiData.aumChange) : completedTransactions.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {managerView ? 'vs previous month' : 'successful entries in visible scope'}
                    </p>
                  </div>
                  <div className="space-y-1 p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      {managerView ? 'Return Improvement' : 'Average Ticket Size'}
                    </p>
                    <p className={cn(
                      'text-2xl font-bold flex items-center gap-1',
                      managerView ? (kpiData.returnChange >= 0 ? 'text-success' : 'text-destructive') : 'text-chart-2'
                    )}>
                      {(managerView ? kpiData.returnChange : completedTransactions.length) >= 0 ? (
                        <TrendingUp className="size-5" />
                      ) : (
                        <TrendingDown className="size-5" />
                      )}
                      {managerView
                        ? formatPercentage(kpiData.returnChange)
                        : formatCurrency(
                            completedTransactions.length
                              ? completedTransactions.reduce((sum, txn) => sum + txn.amount, 0) / completedTransactions.length
                              : 0,
                          )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {managerView ? 'vs previous month' : 'mean completed transaction value'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>
                  {managerView ? 'Clients by risk profile' : 'Assigned customers by risk profile'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roleRiskDistribution.map((risk) => (
                    <div key={risk.level} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{risk.level} Risk</span>
                        <span className="text-sm text-muted-foreground">
                          {risk.count} clients ({risk.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            risk.level === 'Low' ? 'bg-success' :
                            risk.level === 'Moderate' ? 'bg-warning' : 'bg-destructive'
                          )}
                          style={{ width: `${risk.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </RouteGuard>
  )
}
