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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { revenueData, clientGrowthData, kpiData, riskDistributionData } from '@/lib/data/mock-analytics'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import { TrendingUp, TrendingDown, Users, DollarSign, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AnalyticsPage() {
  return (
    <>
      <AdminHeader title="Analytics" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Detailed insights into your business performance and metrics.
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
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-xl font-bold tabular-nums">
                      {formatCurrency(revenueData.reduce((sum, d) => sum + d.revenue, 0))}
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
                    <p className="text-sm text-muted-foreground">Avg. Return</p>
                    <p className="text-xl font-bold tabular-nums text-success">
                      {formatPercentage(kpiData.avgReturn)}
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
                    <p className="text-sm text-muted-foreground">Client Growth</p>
                    <p className="text-xl font-bold tabular-nums">
                      {formatPercentage(kpiData.clientsChange)}
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
                    <p className="text-sm text-muted-foreground">AUM Growth</p>
                    <p className="text-xl font-bold tabular-nums">
                      {formatPercentage(kpiData.aumChange)}
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
                <CardDescription>Monthly revenue by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
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
                <CardDescription>Client count and AUM over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={clientGrowthData}>
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
                <CardDescription>Key metrics compared month-over-month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1 p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Revenue Growth</p>
                    <p className={cn(
                      'text-2xl font-bold flex items-center gap-1',
                      kpiData.revenueChange >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {kpiData.revenueChange >= 0 ? (
                        <TrendingUp className="size-5" />
                      ) : (
                        <TrendingDown className="size-5" />
                      )}
                      {formatPercentage(kpiData.revenueChange)}
                    </p>
                    <p className="text-xs text-muted-foreground">vs previous month</p>
                  </div>
                  <div className="space-y-1 p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">AUM Growth</p>
                    <p className={cn(
                      'text-2xl font-bold flex items-center gap-1',
                      kpiData.aumChange >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {kpiData.aumChange >= 0 ? (
                        <TrendingUp className="size-5" />
                      ) : (
                        <TrendingDown className="size-5" />
                      )}
                      {formatPercentage(kpiData.aumChange)}
                    </p>
                    <p className="text-xs text-muted-foreground">vs previous month</p>
                  </div>
                  <div className="space-y-1 p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Return Improvement</p>
                    <p className={cn(
                      'text-2xl font-bold flex items-center gap-1',
                      kpiData.returnChange >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {kpiData.returnChange >= 0 ? (
                        <TrendingUp className="size-5" />
                      ) : (
                        <TrendingDown className="size-5" />
                      )}
                      {formatPercentage(kpiData.returnChange)}
                    </p>
                    <p className="text-xs text-muted-foreground">vs previous month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Clients by risk profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskDistributionData.map((risk) => (
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
    </>
  )
}
