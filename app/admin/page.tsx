import { AdminHeader } from '@/components/admin/admin-header'
import { StatsCards } from '@/components/admin/stats-cards'
import { PortfolioChart } from '@/components/admin/portfolio-chart'
import { AllocationChart } from '@/components/admin/allocation-chart'
import { RecentTransactions } from '@/components/admin/recent-transactions'
import { ActivityFeed } from '@/components/admin/activity-feed'
import { AlertsPanel } from '@/components/admin/alerts-panel'
import { TopClients } from '@/components/admin/top-clients'
import {
  kpiData,
  portfolioPerformanceData,
  assetAllocationData,
  recentActivities,
  alerts,
  topPerformingClients,
} from '@/lib/data/mock-analytics'
import { getRecentTransactions } from '@/lib/data/mock-transactions'

export default function AdminDashboard() {
  const recentTransactions = getRecentTransactions(6)

  return (
    <>
      <AdminHeader title="Dashboard" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, James. Here&apos;s an overview of your portfolio management.
            </p>
          </div>

          {/* KPI Stats */}
          <StatsCards data={kpiData} />

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            <PortfolioChart data={portfolioPerformanceData} />
            <AllocationChart data={assetAllocationData} />
          </div>

          {/* Bottom Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Transactions and Activity - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <RecentTransactions transactions={recentTransactions} />
            </div>
            
            {/* Right Sidebar - 1 column */}
            <div className="space-y-6">
              <AlertsPanel alerts={alerts} />
              <TopClients clients={topPerformingClients} />
              <ActivityFeed activities={recentActivities.slice(0, 5)} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
