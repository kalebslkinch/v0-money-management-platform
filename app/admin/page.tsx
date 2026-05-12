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
import { Sparkles, Calendar } from 'lucide-react'

export default function AdminDashboard() {
  const recentTransactions = getRecentTransactions(5)

  return (
    <>
      <AdminHeader title="Dashboard" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Page Header with greeting */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Sparkles className="size-5" />
                  <span className="text-sm font-medium">Good morning</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Welcome back, James
                </h1>
                <p className="text-muted-foreground mt-1">
                  Here&apos;s what&apos;s happening with your portfolios today.
                </p>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border/50">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>

            {/* KPI Stats */}
            <StatsCards data={kpiData} />

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3">
              <PortfolioChart data={portfolioPerformanceData} />
              <AllocationChart data={assetAllocationData} />
            </div>

            {/* Bottom Section - Bento Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Transactions - spans 2 columns on lg */}
              <div className="md:col-span-2">
                <RecentTransactions transactions={recentTransactions} />
              </div>
              
              {/* Alerts */}
              <div className="md:col-span-1">
                <AlertsPanel alerts={alerts} />
              </div>
              
              {/* Top Clients */}
              <div className="md:col-span-1">
                <TopClients clients={topPerformingClients} />
              </div>
              
              {/* Activity Feed - spans 2 columns on md */}
              <div className="md:col-span-1 lg:col-span-2">
                <ActivityFeed activities={recentActivities.slice(0, 5)} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
