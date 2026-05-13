import { useState } from 'react'
import { Plus, Users, TrendingUp, Wallet } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { ClientTable } from '@/components/admin/client-table'
import { EditClientDialog } from '@/components/admin/edit-client-dialog'
import { RequestChangeDialog } from '@/components/admin/request-change-dialog'
import { Button } from '@/components/ui/button'
import { RouteGuard } from '@/components/auth/route-guard'
import { useUserRole } from '@/hooks/use-user-role'
import { getVisibleClients } from '@/lib/utils/role-filters'
import { formatCurrency } from '@/lib/utils/format'
import type { Client } from '@/lib/types/admin'

import { PFMSCustomerDashboard } from '@/components/admin/pfms-customer-dashboard'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'

export default function ClientsPage() {
  const { user } = useUserRole()
  const [clients, setClients] = useState<Client[]>(() => getVisibleClients(user))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const isManager = user.role === 'manager'
  const isFA = user.role === 'fa'
  const [requestTarget, setRequestTarget] = useState<Client | null>(null)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)

  if (user.role === 'customer') {
    const snapshot = getPFMSSnapshotForCustomer(user.clientId ?? 'CLT001')
    return (
      <>
        <AdminHeader title="Your Profile" />
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            <div className="mx-auto max-w-3xl space-y-8">
              <PFMSCustomerDashboard snapshot={snapshot} />
            </div>
          </div>
        </main>
      </>
    )
  }

  const visibleClients = clients
  const totalClients = visibleClients.length
  const activeClients = visibleClients.filter(c => c.status === 'active').length
  const weeklyBudgetTotal = visibleClients.reduce((sum, client) => {
    const snapshot = getPFMSSnapshotForCustomer(client.id)
    return sum + snapshot.categories.reduce((categorySum, category) => categorySum + category.weeklyBudget, 0)
  }, 0)

  return (
    <RouteGuard allowedRoles={['manager', 'fa']}>
      <AdminHeader title="Clients" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Clients</h1>
                <p className="text-muted-foreground mt-1">
                  {user.role === 'manager'
                    ? 'Manage customer relationships and weekly spending plans.'
                    : 'Review and manage your assigned client relationships.'}
                </p>
              </div>
              {user.role === 'manager' && (
                <Button
                  className="rounded-xl h-11 px-5 bg-primary hover:bg-primary/90 transition-opacity"
                  onClick={() => { setEditingClient(null); setDialogOpen(true) }}
                >
                  <Plus className="mr-2 size-4" />
                  Add Client
                </Button>
              )}
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
                  <p className="text-sm text-muted-foreground">Weekly Budget Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(weeklyBudgetTotal)}</p>
                </div>
              </div>
            </div>

            {/* Client Table */}
            <ClientTable
              clients={visibleClients}
              showAdvisor={user.role === 'manager'}
              allowActions
              onEdit={isManager ? (client) => { setEditingClient(client); setDialogOpen(true) } : undefined}
              onDelete={isManager ? (id) => setClients(prev => prev.filter(c => c.id !== id)) : undefined}
              onRequestChange={isFA ? (client) => { setRequestTarget(client); setRequestDialogOpen(true) } : undefined}
            />
          </div>
        </div>
      </main>

      {isManager && (
        <EditClientDialog
          client={editingClient}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={(saved) => {
            setClients(prev => {
              const idx = prev.findIndex(c => c.id === saved.id)
              return idx >= 0
                ? prev.map(c => (c.id === saved.id ? saved : c))
                : [...prev, saved]
            })
          }}
        />
      )}
      {isFA && requestTarget && (
        <RequestChangeDialog
          client={requestTarget}
          user={user}
          open={requestDialogOpen}
          onOpenChange={setRequestDialogOpen}
        />
      )}
    </RouteGuard>
  )
}
