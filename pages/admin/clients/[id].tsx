import type { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
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

export default function ClientDetailPage({ client, transactions, portfolio }: ClientDetailPageProps) {
  return (
    <>
      <AdminHeader title={client.name} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Back Button */}
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/admin/clients">
              <ArrowLeft className="mr-2 size-4" />
              Back to Clients
            </Link>
          </Button>

          {/* Client Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="size-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-semibold">{client.name}</h1>
                      <Badge variant="outline" className={cn('capitalize', statusStyles[client.status])}>
                        {client.status}
                      </Badge>
                      <Badge variant="outline" className={cn('capitalize', riskStyles[client.riskLevel])}>
                        {client.riskLevel} risk
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="size-4" />
                        {client.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="size-4" />
                        {client.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        Client since {formatDate(client.joinedDate)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Advisor: <span className="font-medium text-foreground">{client.advisor}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Mail className="mr-2 size-4" />
                    Contact
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Client</DropdownMenuItem>
                      <DropdownMenuItem>Generate Report</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Suspend Account</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">
                  {formatCurrency(client.portfolioValue)}
                </div>
              </CardContent>
            </Card>
            {portfolio && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Daily Change</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn(
                      'flex items-center gap-1 text-2xl font-bold tabular-nums',
                      portfolio.performance.daily >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {portfolio.performance.daily >= 0 ? (
                        <TrendingUp className="size-5" />
                      ) : (
                        <TrendingDown className="size-5" />
                      )}
                      {formatPercentage(portfolio.performance.daily)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Return</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn(
                      'flex items-center gap-1 text-2xl font-bold tabular-nums',
                      portfolio.performance.monthly >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {portfolio.performance.monthly >= 0 ? (
                        <TrendingUp className="size-5" />
                      ) : (
                        <TrendingDown className="size-5" />
                      )}
                      {formatPercentage(portfolio.performance.monthly)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">YTD Return</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn(
                      'flex items-center gap-1 text-2xl font-bold tabular-nums',
                      portfolio.performance.yearly >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {portfolio.performance.yearly >= 0 ? (
                        <TrendingUp className="size-5" />
                      ) : (
                        <TrendingDown className="size-5" />
                      )}
                      {formatPercentage(portfolio.performance.yearly)}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Holdings - 2 columns */}
            {portfolio && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Portfolio Holdings</CardTitle>
                  <CardDescription>Current asset allocation and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {portfolio.holdings.map((holding, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className={cn('text-xs', assetTypeColors[holding.type])}>
                              {holding.type}
                            </Badge>
                            <div>
                              <p className="font-medium">{holding.asset}</p>
                              {holding.ticker && (
                                <p className="text-xs text-muted-foreground">{holding.ticker}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium tabular-nums">{formatCurrency(holding.value)}</p>
                            <p className={cn(
                              'text-xs font-medium',
                              holding.change >= 0 ? 'text-success' : 'text-destructive'
                            )}>
                              {formatPercentage(holding.change)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={holding.allocation} className="h-2" />
                          <span className="text-xs text-muted-foreground w-12 text-right tabular-nums">
                            {holding.allocation}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Transactions - 1 column */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest account activity</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No transactions found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium capitalize">{txn.type}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(txn.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            'font-medium tabular-nums text-sm',
                            txn.type === 'deposit' || txn.type === 'dividend' ? 'text-success' :
                            txn.type === 'withdrawal' || txn.type === 'fee' ? 'text-destructive' : ''
                          )}>
                            {txn.type === 'deposit' || txn.type === 'dividend' ? '+' : ''}
                            {txn.type === 'withdrawal' || txn.type === 'fee' ? '-' : ''}
                            {formatCurrency(txn.amount)}
                          </p>
                          <Badge variant="outline" className={cn('text-xs', transactionStatusColors[txn.status])}>
                            {txn.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Full Transaction History */}
          {transactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Complete record of all transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(txn.date)}
                        </TableCell>
                        <TableCell className="capitalize font-medium">{txn.type}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {txn.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('capitalize', transactionStatusColors[txn.status])}>
                            {txn.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(
                          'text-right font-medium tabular-nums',
                          txn.type === 'deposit' || txn.type === 'dividend' ? 'text-success' :
                          txn.type === 'withdrawal' || txn.type === 'fee' ? 'text-destructive' : ''
                        )}>
                          {txn.type === 'deposit' || txn.type === 'dividend' ? '+' : ''}
                          {txn.type === 'withdrawal' || txn.type === 'fee' ? '-' : ''}
                          {formatCurrency(txn.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
