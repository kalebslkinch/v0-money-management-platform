import Link from 'next/link'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PFMSCustomerBudgets } from '@/components/admin/pfms-customer-budgets'
import { useUserRole } from '@/hooks/use-user-role'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'
import { getVisibleClients } from '@/lib/utils/role-filters'
import { formatCurrency, getInitials } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

export default function PortfoliosPage() {
  const { user } = useUserRole()

  if (user.role === 'customer') {
    const snapshot = getPFMSSnapshotForCustomer(user.clientId ?? 'CLT001')

    return (
      <>
        <AdminHeader title="Budgets" />
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl">
            <PFMSCustomerBudgets snapshot={snapshot} />
          </div>
        </main>
      </>
    )
  }

  const visibleClients = getVisibleClients(user)
  const customerBudgets = visibleClients
    .map(client => {
      const snapshot = getPFMSSnapshotForCustomer(client.id)
      const weeklyBudget = snapshot.categories.reduce((sum, category) => sum + category.weeklyBudget, 0)
      const spent = snapshot.categories.reduce((sum, category) => sum + category.spent, 0)
      const projected = snapshot.categories.reduce((sum, category) => sum + category.projectedSpend, 0)
      const usage = weeklyBudget > 0 ? (spent / weeklyBudget) * 100 : 0
      return { client, snapshot, weeklyBudget, spent, projected, usage }
    })
    .sort((a, b) => b.weeklyBudget - a.weeklyBudget)

  const totalWeeklyBudget = customerBudgets.reduce((sum, row) => sum + row.weeklyBudget, 0)
  const totalSpent = customerBudgets.reduce((sum, row) => sum + row.spent, 0)
  const overPaceCount = customerBudgets.filter(row => row.projected > row.weeklyBudget).length

  return (
    <>
      <AdminHeader title="Budgets" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Customer Budget Plans</h1>
            <p className="text-muted-foreground">
              {user.role === 'manager'
                ? 'Monitor weekly spending plans and intervention opportunities across all customers.'
                : 'Monitor weekly spending plans for your assigned customers.'}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Weekly Budget Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{formatCurrency(totalWeeklyBudget)}</div>
                <p className="text-xs text-muted-foreground mt-1">Across {customerBudgets.length} customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Spend Recorded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{formatCurrency(totalSpent)}</div>
                <p className="text-xs text-muted-foreground mt-1">Current week category transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Customers Over Pace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{overPaceCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Projected to exceed weekly budget</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Budget Health by Customer</CardTitle>
              <CardDescription>Focus on Tesco grocery and food delivery pressure first.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerBudgets.map(({ client, snapshot, weeklyBudget, spent, projected, usage }) => {
                  const tesco = snapshot.categories.find(category => category.id === 'tesco-grocery')
                  const delivery = snapshot.categories.find(category => category.id === 'food-delivery')
                  const overPace = projected > weeklyBudget

                  return (
                    <Link
                      key={client.id}
                      href={`/admin/clients/${client.id}`}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{client.name}</p>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              overPace
                                ? 'bg-destructive/10 text-destructive border-destructive/20'
                                : 'bg-success/10 text-success border-success/20',
                            )}
                          >
                            {overPace ? 'Over pace' : 'On track'}
                          </Badge>
                        </div>

                        <Progress value={Math.min(100, Math.round(usage))} className="h-2" />

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>Tesco: {formatCurrency(tesco?.spent ?? 0)} / {formatCurrency(tesco?.weeklyBudget ?? 0)}</span>
                          <span>Food delivery: {formatCurrency(delivery?.spent ?? 0)} / {formatCurrency(delivery?.weeklyBudget ?? 0)}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold tabular-nums">{formatCurrency(spent)} / {formatCurrency(weeklyBudget)}</p>
                        <div className={cn('flex items-center justify-end gap-1 text-sm', overPace ? 'text-destructive' : 'text-success')}>
                          {overPace ? <AlertTriangle className="size-3" /> : <CheckCircle2 className="size-3" />}
                          <span className="tabular-nums">Projected {formatCurrency(projected)}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
