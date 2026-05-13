import React from 'react'
import type { WidgetId, WidgetConfig, WidgetSize } from '@/lib/types/dashboard'
import { StatsCards } from '@/components/admin/stats-cards'
import { PortfolioChart } from '@/components/admin/portfolio-chart'
import { AllocationChart } from '@/components/admin/allocation-chart'
import { RecentTransactions } from '@/components/admin/recent-transactions'
import { ActivityFeed } from '@/components/admin/activity-feed'
import { AlertsPanel } from '@/components/admin/alerts-panel'
import { TopClients } from '@/components/admin/top-clients'
import { StaffTable } from '@/components/admin/staff-table'
import {
  kpiData,
  portfolioPerformanceData,
  assetAllocationData,
  recentActivities,
  alerts,
  topPerformingClients,
} from '@/lib/data/mock-analytics'
import { getRecentTransactions } from '@/lib/data/mock-transactions'
import { mockAdvisors } from '@/lib/data/mock-advisors'

// ─── Widget Definitions ───────────────────────────────────────────────────────

export const WIDGET_REGISTRY: Record<WidgetId, WidgetConfig> = {
  'stats-cards': {
    id: 'stats-cards',
    label: 'KPI Overview',
    description: 'Total AUM, active clients, monthly revenue, and average returns at a glance.',
    category: 'kpi',
    defaultSize: 'full',
    minSize: 'full',
    icon: 'LayoutDashboard',
  },
  'portfolio-chart': {
    id: 'portfolio-chart',
    label: 'Portfolio Performance',
    description: 'Firm AUM vs. S&P 500 benchmark trend over the last 6 months.',
    category: 'chart',
    defaultSize: 'medium',
    minSize: 'small',
    icon: 'TrendingUp',
  },
  'allocation-chart': {
    id: 'allocation-chart',
    label: 'Asset Allocation',
    description: 'Donut chart breakdown of asset classes across all managed portfolios.',
    category: 'chart',
    defaultSize: 'medium',
    minSize: 'small',
    icon: 'PieChart',
  },
  'recent-transactions': {
    id: 'recent-transactions',
    label: 'Recent Transactions',
    description: 'Latest income, bill payments, card spending, refunds, and bank fees.',
    category: 'data',
    defaultSize: 'full',
    minSize: 'small',
    icon: 'ArrowLeftRight',
  },
  'activity-feed': {
    id: 'activity-feed',
    label: 'Activity Feed',
    description: 'Real-time timeline of client events, meetings, and document actions.',
    category: 'data',
    defaultSize: 'medium',
    minSize: 'small',
    icon: 'Activity',
  },
  'alerts-panel': {
    id: 'alerts-panel',
    label: 'Alerts',
    description: 'Compliance warnings, portfolio drift alerts, and critical flags requiring action.',
    category: 'alerts',
    defaultSize: 'medium',
    minSize: 'small',
    autoPromote: true,
    icon: 'ShieldAlert',
  },
  'top-clients': {
    id: 'top-clients',
    label: 'Top Clients',
    description: 'Highest-value clients ranked by portfolio size and YTD performance.',
    category: 'data',
    defaultSize: 'medium',
    minSize: 'small',
    icon: 'Star',
  },
  'staff-table': {
    id: 'staff-table',
    label: 'Advisor Performance',
    description: 'Full advisory team roster with AUM, performance metrics, and status.',
    category: 'data',
    defaultSize: 'full',
    minSize: 'medium',
    icon: 'Users',
  },
}

// ─── Widget Renderer ──────────────────────────────────────────────────────────

const recentTransactions = getRecentTransactions(8)

/**
 * Given a widgetId and a size, returns the rendered React element.
 * All data is sourced from mock data — no props needed from parent.
 */
export function renderWidget(widgetId: WidgetId, _size: WidgetSize): React.ReactElement {
  switch (widgetId) {
    case 'stats-cards':
      return <StatsCards data={kpiData} />

    case 'portfolio-chart':
      return <PortfolioChart data={portfolioPerformanceData} />

    case 'allocation-chart':
      return <AllocationChart data={assetAllocationData} />

    case 'recent-transactions':
      return <RecentTransactions transactions={recentTransactions} />

    case 'activity-feed':
      return <ActivityFeed activities={recentActivities.slice(0, 6)} />

    case 'alerts-panel':
      return <AlertsPanel alerts={alerts} />

    case 'top-clients':
      return <TopClients clients={topPerformingClients} />

    case 'staff-table':
      return <StaffTable advisors={mockAdvisors} />
  }
}

/** Ordered list of widget ids for the widget picker (logical grouping) */
export const WIDGET_PICKER_ORDER: WidgetId[] = [
  'stats-cards',
  'portfolio-chart',
  'allocation-chart',
  'alerts-panel',
  'recent-transactions',
  'top-clients',
  'activity-feed',
  'staff-table',
]
