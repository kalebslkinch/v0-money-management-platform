import { Plus } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { ClientTable } from '@/components/admin/client-table'
import { Button } from '@/components/ui/button'
import { mockClients } from '@/lib/data/mock-clients'

export default function ClientsPage() {
  return (
    <>
      <AdminHeader
        title="Clients"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Clients' },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
              <p className="text-muted-foreground">
                Manage your client relationships and portfolios.
              </p>
            </div>
            <Button>
              <Plus className="mr-2 size-4" />
              Add Client
            </Button>
          </div>

          {/* Client Table */}
          <ClientTable clients={mockClients} />
        </div>
      </main>
    </>
  )
}
