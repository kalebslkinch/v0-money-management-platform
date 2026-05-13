import { AdminHeader } from '@/components/admin/admin-header'
import { DashboardToolbar } from '@/components/admin/dashboard-toolbar'
import { DashboardGrid } from '@/components/admin/dashboard-grid'
import { useDashboardLayout } from '@/hooks/use-dashboard-layout'

export default function AdminDashboard() {
  const layout = useDashboardLayout()

  return (
    <>
      <AdminHeader title="Dashboard" />
      <main className="flex-1 overflow-auto">
        <DashboardToolbar layout={layout} managerName="James" />
        <div className="px-6 md:px-8 pt-6 pb-8">
          <div className="mx-auto max-w-7xl">
            <DashboardGrid layout={layout} />
          </div>
        </div>
      </main>
    </>
  )
}
