import { Plus, Users, TrendingUp, Wallet } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { ClientTable } from '@/components/admin/client-table'
import { Button } from '@/components/ui/button'
import { mockClients } from '@/lib/data/mock-clients'
import { formatCurrency } from '@/lib/utils/format'

export default function ClientsPage() {
  const totalClients = mockClients.length
  const activeClients = mockClients.filter(c => c.status === 'active').length
  const totalAUM = mockClients.reduce((sum, c) => sum + c.portfolioValue, 0)

  return (
    <>
      <AdminHeader title="Clients" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Clients</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your client relationships and portfolios.
                </p>
              </div>
              <Button className="rounded-xl h-11 px-5 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90 transition-opacity">
                <Plus className="mr-2 size-4" />
                Add Client
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                  <p className="text-2xl font-bold">{totalClients}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50">
                <div className="flex size-12 items-center justify-center rounded-xl bg-chart-2/10">
                  <TrendingUp className="size-6 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Clients</p>
                  <p className="text-2xl font-bold">{activeClients}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50">
                <div className="flex size-12 items-center justify-center rounded-xl bg-chart-4/10">
                  <Wallet className="size-6 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total AUM</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalAUM, true)}</p>
                </div>
              </div>
            </div>

            {/* Client Table */}
            <ClientTable clients={mockClients} />
          </div>
        </div>
      </main>
    </>
  )
}
