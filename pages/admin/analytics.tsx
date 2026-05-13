import { useMemo } from 'react'
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
} from 'recharts'
import { AdminHeader } from '@/components/admin/admin-header'
import { RouteGuard } from '@/components/auth/route-guard'
import { useUserRole } from '@/hooks/use-user-role'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getVisibleClients, getVisibleTransactions } from '@/lib/utils/role-filters'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import { DollarSign, TrendingUp, Users, AlertTriangle } from 'lucide-react'

export default function AnalyticsPage() {
  const { user } = useUserRole()

  const visibleClients = useMemo(() => getVisibleClients(user), [user])
  const visibleTransactions = useMemo(() => getVisibleTransactions(user), [user])

  const snapshots = useMemo(
    () => visibleClients.map(client => getPFMSSnapshotForCustomer(client.id)),
    [visibleClients],
  )

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

  return (
    <RouteGuard allowedRoles={['manager', 'fa']}>
      <AdminHeader title="Analytics" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">PFMS Analytics</h1>
            <p className="text-muted-foreground">
              Budget adherence, category pressure, and weekly cash movement across your visible customers.
            </p>
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
              <CardHeader>
                <CardTitle>Cash Movement by Month</CardTitle>
                <CardDescription>Completed inflow vs outflow from visible transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={value => `$${Math.round(value / 1000)}k`}
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
                      <Bar dataKey="inflow" name="Inflow" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="outflow" name="Outflow" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Spend Categories</CardTitle>
                <CardDescription>Where spending is concentrated this week.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={value => `$${Math.round(value)}`}
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
        </div>
      </main>
    </RouteGuard>
  )
}
