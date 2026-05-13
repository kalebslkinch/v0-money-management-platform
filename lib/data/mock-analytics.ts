import type { KPIData, RevenueData, ClientGrowthData, Activity, Alert } from '@/lib/types/admin'
import { mockClients } from './mock-clients'

// Calculate KPIs from mock data
export const kpiData: KPIData = {
  totalAUM: mockClients.reduce((sum, client) => sum + client.portfolioValue, 0),
  aumChange: 8.5,
  activeClients: mockClients.filter(c => c.status === 'active').length,
  clientsChange: 12,
  monthlyRevenue: 125000,
  revenueChange: 5.2,
  avgReturn: 12.4,
  returnChange: 2.1,
}

// Monthly performance data for charts
export const portfolioPerformanceData = [
  { month: 'Aug', value: 28500000, benchmark: 27800000 },
  { month: 'Sep', value: 29200000, benchmark: 28100000 },
  { month: 'Oct', value: 28800000, benchmark: 27500000 },
  { month: 'Nov', value: 30500000, benchmark: 29000000 },
  { month: 'Dec', value: 32100000, benchmark: 30200000 },
  { month: 'Jan', value: 34180000, benchmark: 31500000 },
]

// Asset allocation data
export const assetAllocationData = [
  { name: 'Stocks', value: 45, fill: 'var(--color-chart-1)' },
  { name: 'Bonds', value: 25, fill: 'var(--color-chart-2)' },
  { name: 'ETFs', value: 15, fill: 'var(--color-chart-3)' },
  { name: 'Real Estate', value: 10, fill: 'var(--color-chart-4)' },
  { name: 'Cash', value: 5, fill: 'var(--color-chart-5)' },
]

// Revenue data for charts
export const revenueData: RevenueData[] = [
  { month: 'Aug', revenue: 98000, fees: 72000, commissions: 26000 },
  { month: 'Sep', revenue: 105000, fees: 78000, commissions: 27000 },
  { month: 'Oct', revenue: 102000, fees: 75000, commissions: 27000 },
  { month: 'Nov', revenue: 118000, fees: 88000, commissions: 30000 },
  { month: 'Dec', revenue: 122000, fees: 90000, commissions: 32000 },
  { month: 'Jan', revenue: 125000, fees: 92000, commissions: 33000 },
]

// Client growth data
export const clientGrowthData: ClientGrowthData[] = [
  { month: 'Aug', clients: 8, aum: 28500000 },
  { month: 'Sep', clients: 9, aum: 29200000 },
  { month: 'Oct', clients: 9, aum: 28800000 },
  { month: 'Nov', clients: 10, aum: 30500000 },
  { month: 'Dec', clients: 11, aum: 32100000 },
  { month: 'Jan', clients: 12, aum: 34180000 },
]

// Risk distribution
export const riskDistributionData = [
  { level: 'Low', count: 4, percentage: 33, fill: 'var(--color-chart-2)' },
  { level: 'Moderate', count: 5, percentage: 42, fill: 'var(--color-chart-4)' },
  { level: 'High', count: 3, percentage: 25, fill: 'var(--color-chart-1)' },
]

// Recent activities
export const recentActivities: Activity[] = [
  {
    id: 'ACT001',
    type: 'transaction',
    title: 'Large deposit received',
    description: 'Michael Chen deposited $250,000',
    timestamp: '2024-01-15T09:15:00',
    clientId: 'CLT002',
    clientName: 'Michael Chen',
  },
  {
    id: 'ACT002',
    type: 'client_added',
    title: 'New client onboarded',
    description: 'Amanda Foster completed account setup',
    timestamp: '2024-01-14T14:30:00',
    clientId: 'CLT005',
    clientName: 'Amanda Foster',
  },
  {
    id: 'ACT003',
    type: 'alert',
    title: 'Portfolio rebalance needed',
    description: 'Robert Thompson exceeded risk threshold',
    timestamp: '2024-01-14T11:00:00',
    clientId: 'CLT006',
    clientName: 'Robert Thompson',
  },
  {
    id: 'ACT004',
    type: 'meeting',
    title: 'Quarterly review scheduled',
    description: 'Meeting with Sarah Mitchell on Jan 20',
    timestamp: '2024-01-13T16:00:00',
    clientId: 'CLT001',
    clientName: 'Sarah Mitchell',
  },
  {
    id: 'ACT005',
    type: 'document',
    title: 'Documents signed',
    description: 'David Kim signed updated IPS',
    timestamp: '2024-01-13T10:30:00',
    clientId: 'CLT004',
    clientName: 'David Kim',
  },
  {
    id: 'ACT006',
    type: 'transaction',
    title: 'Withdrawal processed',
    description: 'Thomas Anderson withdrew $150,000',
    timestamp: '2024-01-12T10:00:00',
    clientId: 'CLT010',
    clientName: 'Thomas Anderson',
  },
]

// Alerts and warnings
export const alerts: Alert[] = [
  {
    id: 'ALT001',
    type: 'warning',
    title: 'Portfolio Drift',
    message: 'Robert Thompson portfolio drifted 8% from target allocation',
    clientId: 'CLT006',
    clientName: 'Robert Thompson',
    timestamp: '2024-01-15T08:00:00',
  },
  {
    id: 'ALT002',
    type: 'danger',
    title: 'Compliance Review',
    message: 'Michael Chen requires annual KYC update',
    clientId: 'CLT002',
    clientName: 'Michael Chen',
    timestamp: '2024-01-14T09:00:00',
  },
  {
    id: 'ALT003',
    type: 'info',
    title: 'Document Expiring',
    message: 'Elizabeth Harper IPS expires in 30 days',
    clientId: 'CLT003',
    clientName: 'Elizabeth Harper',
    timestamp: '2024-01-13T12:00:00',
  },
]

// Top performing clients
export const topPerformingClients = mockClients
  .filter(c => c.status === 'active')
  .sort((a, b) => b.portfolioValue - a.portfolioValue)
  .slice(0, 5)
  .map(client => {
    // Deterministic mock YTD return derived from the client id — avoids
    // server/client Math.random() hydration mismatch.
    const seed = client.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    const ytdReturn = 5 + (seed % 200) / 10 // stable value in range 5–25%
    return { ...client, ytdReturn }
  })
