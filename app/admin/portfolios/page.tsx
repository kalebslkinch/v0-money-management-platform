import Link from 'next/link'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { mockClients } from '@/lib/data/mock-clients'
import { mockPortfolios } from '@/lib/data/mock-portfolios'
import { assetAllocationData, riskDistributionData } from '@/lib/data/mock-analytics'
import { formatCurrency, formatPercentage, getInitials } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

const riskStyles = {
  low: 'bg-success/10 text-success border-success/20',
  moderate: 'bg-warning/10 text-warning border-warning/20',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
}

export default function PortfoliosPage() {
  // Get clients that have portfolios
  const clientsWithPortfolios = mockClients
    .filter(client => mockPortfolios[client.id])
    .map(client => ({
      ...client,
      portfolio: mockPortfolios[client.id],
    }))
    .sort((a, b) => b.portfolioValue - a.portfolioValue)

  const totalAUM = clientsWithPortfolios.reduce((sum, c) => sum + c.portfolioValue, 0)

  return (
    <>
      <AdminHeader
        title="Portfolios"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Portfolios' },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Portfolios</h1>
            <p className="text-muted-foreground">
              Overview of all client portfolios and asset allocation.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total AUM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">
                  {formatCurrency(totalAUM)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {clientsWithPortfolios.length} portfolios
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {assetAllocationData.slice(0, 3).map((asset) => (
                    <div key={asset.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: asset.fill }} />
                      <span className="text-sm flex-1">{asset.name}</span>
                      <span className="text-sm font-medium tabular-nums">{asset.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {riskDistributionData.map((risk) => (
                    <div key={risk.level} className="flex items-center gap-2">
                      <Badge variant="outline" className={cn('text-xs capitalize', riskStyles[risk.level as keyof typeof riskStyles])}>
                        {risk.level}
                      </Badge>
                      <Progress value={risk.percentage} className="h-2 flex-1" />
                      <span className="text-sm text-muted-foreground tabular-nums w-8">
                        {risk.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio List */}
          <Card>
            <CardHeader>
              <CardTitle>Client Portfolios</CardTitle>
              <CardDescription>Performance comparison across all managed portfolios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientsWithPortfolios.map((client) => (
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
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{client.name}</p>
                        <Badge variant="outline" className={cn('text-xs capitalize', riskStyles[client.riskLevel])}>
                          {client.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {client.portfolio.holdings.length} holdings
                      </p>
                    </div>

                    <div className="hidden sm:block">
                      <div className="flex gap-1">
                        {client.portfolio.holdings.slice(0, 4).map((holding, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {holding.ticker || holding.type}
                          </Badge>
                        ))}
                        {client.portfolio.holdings.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{client.portfolio.holdings.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold tabular-nums">
                        {formatCurrency(client.portfolioValue)}
                      </p>
                      <div className={cn(
                        'flex items-center justify-end gap-1 text-sm',
                        client.portfolio.performance.monthly >= 0 ? 'text-success' : 'text-destructive'
                      )}>
                        {client.portfolio.performance.monthly >= 0 ? (
                          <TrendingUp className="size-3" />
                        ) : (
                          <TrendingDown className="size-3" />
                        )}
                        <span className="tabular-nums">
                          {formatPercentage(client.portfolio.performance.monthly)} MTD
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
