import { useState } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { DashboardToolbar } from '@/components/admin/dashboard-toolbar'
import { DashboardGrid } from '@/components/admin/dashboard-grid'
import { PFMSCustomerDashboard } from '@/components/admin/pfms-customer-dashboard'
import { RequestConsultationDialog } from '@/components/admin/request-consultation-dialog'
import { Button } from '@/components/ui/button'
import { useDashboardLayout } from '@/hooks/use-dashboard-layout'
import { useUserRole } from '@/hooks/use-user-role'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'
import { getAdvisorByClientId } from '@/lib/data/mock-advisors'
import { CalendarPlus } from 'lucide-react'

export default function AdminDashboard() {
  const layout = useDashboardLayout()
  const { user } = useUserRole()
  const [consultOpen, setConsultOpen] = useState(false)

  if (user.role === 'customer') {
    const clientId = user.clientId ?? 'CLT001'
    const snapshot = getPFMSSnapshotForCustomer(clientId)
    const advisor = getAdvisorByClientId(clientId)

    return (
      <>
        <AdminHeader title="My Budget" />
        <main className="flex-1 overflow-auto">
          <div className="px-6 md:px-8 pt-6 pb-8">
            <div className="mx-auto max-w-7xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user.name.split(' ')[0]}</h1>
                  <p className="text-sm text-muted-foreground">Here&apos;s your financial overview for this week.</p>
                </div>
                <Button
                  className="rounded-xl gap-2 bg-primary hover:bg-primary/90"
                  onClick={() => setConsultOpen(true)}
                >
                  <CalendarPlus className="size-4" />
                  Request Consultation
                </Button>
              </div>
              <PFMSCustomerDashboard snapshot={snapshot} />
            </div>
          </div>
        </main>

        <RequestConsultationDialog
          open={consultOpen}
          onOpenChange={setConsultOpen}
          clientId={clientId}
          clientName={user.name}
          advisorId={advisor?.id ?? 'ADV001'}
          advisorName={advisor?.name ?? 'Your Advisor'}
        />
      </>
    )
  }

  return (
    <>
      <AdminHeader title="Dashboard" />
      <main className="flex-1 overflow-auto">
        <DashboardToolbar layout={layout} managerName={user.name.split(' ')[0] ?? 'Manager'} />
        <div className="px-6 md:px-8 pt-6 pb-8">
          <div className="mx-auto max-w-7xl">
            <DashboardGrid layout={layout} />
          </div>
        </div>
      </main>
    </>
  )
}
