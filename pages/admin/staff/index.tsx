import { useState } from 'react'
import { Plus, Users, TrendingUp, DollarSign, Activity } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { StaffTable } from '@/components/admin/staff-table'
import { EditStaffDialog } from '@/components/admin/edit-staff-dialog'
import { Button } from '@/components/ui/button'
import { RouteGuard } from '@/components/auth/route-guard'
import { mockAdvisors } from '@/lib/data/mock-advisors'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import type { Advisor } from '@/lib/types/admin'

export default function StaffPage() {
  const [staff, setStaff] = useState<Advisor[]>(mockAdvisors)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null)

  const totalStaff = staff.length
  const activeStaff = staff.filter(a => a.status === 'active').length
  const totalAUM = staff.reduce((sum, a) => sum + a.totalAUM, 0)
  const avgMonthly = staff.length > 0
    ? staff.reduce((sum, a) => sum + a.performance.monthly, 0) / staff.length
    : 0

  const handleSave = (saved: Advisor) => {
    setStaff(prev => {
      const idx = prev.findIndex(a => a.id === saved.id)
      return idx >= 0 ? prev.map(a => a.id === saved.id ? saved : a) : [...prev, saved]
    })
  }

  return (
    <RouteGuard allowedRoles={['manager']}>
      <AdminHeader title="Staff" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Staff</h1>
                <p className="text-muted-foreground mt-1">Manage your advisory team and track performance.</p>
              </div>
              <Button
                className="rounded-xl h-11 px-5 bg-primary hover:bg-primary/90"
                onClick={() => { setEditingAdvisor(null); setDialogOpen(true) }}
              >
                <Plus className="mr-2 size-4" />
                Add Staff
              </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Staff</p>
                  <p className="text-2xl font-bold">{totalStaff}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50">
                <div className="flex size-12 items-center justify-center rounded-xl bg-success/10">
                  <Activity className="size-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{activeStaff}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50">
                <div className="flex size-12 items-center justify-center rounded-xl bg-chart-3/10">
                  <DollarSign className="size-6 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total AUM</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalAUM, true)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50">
                <div className="flex size-12 items-center justify-center rounded-xl bg-chart-4/10">
                  <TrendingUp className="size-6 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Monthly Return</p>
                  <p className="text-2xl font-bold">{formatPercentage(avgMonthly)}</p>
                </div>
              </div>
            </div>

            {/* Table */}
            <StaffTable
              advisors={staff}
              onEdit={a => { setEditingAdvisor(a); setDialogOpen(true) }}
              onRemove={a => setStaff(prev => prev.filter(s => s.id !== a.id))}
            />
          </div>
        </div>
      </main>

      <EditStaffDialog
        advisor={editingAdvisor}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />
    </RouteGuard>
  )
}
