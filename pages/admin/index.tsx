import { AdminHeader } from '@/components/admin/admin-header'
import { DashboardToolbar } from '@/components/admin/dashboard-toolbar'
import { DashboardGrid } from '@/components/admin/dashboard-grid'
import { PFMSCustomerDashboard } from '@/components/admin/pfms-customer-dashboard'
import { useDashboardLayout } from '@/hooks/use-dashboard-layout'
import { useUserRole } from '@/hooks/use-user-role'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'

export default function AdminDashboard() {
  const layout = useDashboardLayout()
  const { user } = useUserRole()

  if (user.role === 'customer') {
    const snapshot = getPFMSSnapshotForCustomer(user.clientId ?? 'CLT001')

    return (
      <>
        <AdminHeader title="My Budget" />
        <main className="flex-1 overflow-auto">
          <div className="px-6 md:px-8 pt-6 pb-8">
            <div className="mx-auto max-w-7xl">
              <PFMSCustomerDashboard snapshot={snapshot} />
            </div>
          </div>
        </main>
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
