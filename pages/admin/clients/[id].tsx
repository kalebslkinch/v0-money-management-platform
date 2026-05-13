import type { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  MoreHorizontal,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockClients, getClientById } from '@/lib/data/mock-clients'
import { getTransactionsByClientId } from '@/lib/data/mock-transactions'
import { getPortfolioByClientId } from '@/lib/data/mock-portfolios'
import { useUserRole } from '@/hooks/use-user-role'
import { canAccessClient } from '@/lib/utils/role-filters'
import { formatCurrency, formatDate, formatPercentage, getInitials, formatDateTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import type { Client, Transaction, Portfolio } from '@/lib/types/admin'

const statusStyles = {
  active: 'bg-success/10 text-success border-success/20',
  inactive: 'bg-muted text-muted-foreground border-muted',
  pending: 'bg-warning/10 text-warning border-warning/20',
}

const riskStyles = {
  low: 'bg-success/10 text-success border-success/20',
  moderate: 'bg-warning/10 text-warning border-warning/20',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
}

const assetTypeColors = {
  stock: 'bg-chart-1/10 text-chart-1',
  bond: 'bg-chart-2/10 text-chart-2',
  etf: 'bg-chart-3/10 text-chart-3',
  cash: 'bg-muted text-muted-foreground',
  crypto: 'bg-chart-4/10 text-chart-4',
  'real-estate': 'bg-chart-5/10 text-chart-5',
}

const transactionStatusColors = {
  completed: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
}

interface ClientDetailPageProps {
  client: Client
  transactions: Transaction[]
  portfolio: Portfolio | null
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = mockClients.map(client => ({
    params: { id: client.id },
  }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<ClientDetailPageProps> = async ({ params }) => {
  const id = params?.id as string
  const client = getClientById(id)

  if (!client) {
    return { notFound: true }
  }

  const transactions = getTransactionsByClientId(id)
  const portfolio = getPortfolioByClientId(id) ?? null

  return {
    props: { client, transactions, portfolio },
  }
}

import { PFMSCustomerDashboard } from '@/components/admin/pfms-customer-dashboard'
import { PFMSCustomerBudgets } from '@/components/admin/pfms-customer-budgets'
import { PFMSCustomerSpending } from '@/components/admin/pfms-customer-spending'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'

export default function ClientDetailPage({ client, transactions, portfolio }: ClientDetailPageProps) {
  const router = useRouter()
  const { user, isHydrated } = useUserRole()
  const hasAccess = canAccessClient(user, client)

  useEffect(() => {
    if (!isHydrated || hasAccess) return
    router.replace('/admin')
  }, [hasAccess, isHydrated, router])

  if (!isHydrated || !hasAccess) {
    return null
  }

  const backLink = user.role === 'customer' ? '/admin' : '/admin/clients'

  if (user.role === 'customer') {
    const snapshot = getPFMSSnapshotForCustomer(user.clientId ?? 'CLT001')
    return (
      <>
        <AdminHeader title="Your Finances" />
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-3xl space-y-8">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link href={backLink}>
                <ArrowLeft className="mr-2 size-4" />
                Back to Dashboard
              </Link>
            </Button>
            <PFMSCustomerDashboard snapshot={snapshot} />
            <PFMSCustomerBudgets snapshot={snapshot} />
            <PFMSCustomerSpending snapshot={snapshot} />
          </div>
        </main>
      </>
    )
  }

  // ...existing code for manager/fa...

  const pfmsSnapshot = getPFMSSnapshotForCustomer(client.id)


  return (
    <>
      <AdminHeader title={client.name} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Back Button */}
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href={backLink}>
              <ArrowLeft className="mr-2 size-4" />
              Back to Clients
            </Link>
          </Button>


          {/* Client Header */}
          <Card className="rounded-2xl border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                <Avatar className="size-16 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {getInitials(client.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold tracking-tight">{client.name}</h2>
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize', {
                      'bg-success/10 text-success border-success/20': client.status === 'active',
                      'bg-muted text-muted-foreground border-muted': client.status === 'inactive',
                      'bg-warning/10 text-warning border-warning/20': client.status === 'pending',
                    })}>
                      {client.status}
                    </span>
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize', {
                      'bg-success/10 text-success border-success/20': client.riskLevel === 'low',
                      'bg-warning/10 text-warning border-warning/20': client.riskLevel === 'moderate',
                      'bg-destructive/10 text-destructive border-destructive/20': client.riskLevel === 'high',
                    })}>
                      {client.riskLevel} risk
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="size-4 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="size-4 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-4 shrink-0" />
                      <span>Joined {formatDate(client.joinedDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-4 shrink-0" />
                      <span>Active {formatDate(client.lastActivity)}</span>
                    </div>
                  </div>
                  {user.role === 'manager' && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Advisor: <span className="font-medium text-foreground">{client.advisor}</span>
                    </p>
                  )}
                </div>
                {user.role === 'manager' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="shrink-0 rounded-xl">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <a href={`mailto:${client.email}`}>
                          <Mail className="mr-2 size-4" />
                          Send Email
                        </a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio */}
          {portfolio ? (
            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>
                  Total value:{' '}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(portfolio.totalValue)}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Performance row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => {
                    const val = portfolio.performance[period]
                    const positive = val >= 0
                    return (
                      <div key={period} className="rounded-xl bg-muted/30 p-3">
                        <p className="text-xs text-muted-foreground capitalize mb-1">{period}</p>
                        <div className={cn('flex items-center gap-1 font-semibold text-sm', positive ? 'text-success' : 'text-destructive')}>
                          {positive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                          {formatPercentage(val)}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Holdings table */}
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>Asset</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="w-[160px]">Allocation</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portfolio.holdings.map((holding) => (
                        <TableRow key={holding.asset} className="hover:bg-muted/20">
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{holding.asset}</p>
                              {holding.ticker && (
                                <p className="text-xs text-muted-foreground">{holding.ticker}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize', assetTypeColors[holding.type])}>
                              {holding.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums text-sm">
                            {formatCurrency(holding.value)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={holding.allocation} className="h-1.5 flex-1" />
                              <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
                                {holding.allocation.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn('text-sm font-medium tabular-nums', holding.change >= 0 ? 'text-success' : 'text-destructive')}>
                              {formatPercentage(holding.change)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No portfolio data available for this client.</p>
              </CardContent>
            </Card>
          )}

          {/* Transactions */}
          <Card className="rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>{transactions.length} transaction{transactions.length !== 1 ? 's' : ''} on record</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No transactions found for this client.</p>
              ) : (
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((txn) => (
                        <TableRow key={txn.id} className="hover:bg-muted/20">
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-muted text-muted-foreground">
                              {txn.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{txn.description ?? '—'}</TableCell>
                          <TableCell className="text-right font-medium tabular-nums text-sm">
                            {formatCurrency(txn.amount)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground tabular-nums">
                            {formatDateTime(txn.date)}
                          </TableCell>
                          <TableCell>
                            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize', transactionStatusColors[txn.status])}>
                              {txn.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PFMS Budget & Spending */}
          <PFMSCustomerBudgets snapshot={pfmsSnapshot} />
          <PFMSCustomerSpending snapshot={pfmsSnapshot} />
        </div>
      </main>
    </>
  )
}
