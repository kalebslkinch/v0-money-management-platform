import type { KPIData, RevenueData, ClientGrowthData, Activity, Alert } from '@/lib/types/admin'
import { mockClients } from './mock-clients'

export const kpiData: KPIData = {
  clientsOnTrack: mockClients.filter(c => c.budgetHealth === 'on_track').length,
  onTrackChange: 8.5,
  activeClients: mockClients.filter(c => c.status === 'active').length,
  clientsChange: 12,
  monthlyRevenue: 125000,
  revenueChange: 5.2,
  avgBudgetAdherence: 72,
  adherenceChange: 3.5,
}

// Monthly spending vs budget totals across all clients
export const budgetAdherenceData = [
  { month: 'Aug', value: 27800, benchmark: 31600 },
  { month: 'Sep', value: 28400, benchmark: 31600 },
  { month: 'Oct', value: 30100, benchmark: 31600 },
  { month: 'Nov', value: 28900, benchmark: 31600 },
  { month: 'Dec', value: 29700, benchmark: 31600 },
  { month: 'Jan', value: 33200, benchmark: 31600 },
]

// Average spending category breakdown across all clients
export const spendingBreakdownData = [
  { name: 'Housing', value: 35, fill: 'var(--color-chart-1)' },
  { name: 'Groceries', value: 22, fill: 'var(--color-chart-2)' },
  { name: 'Transport', value: 15, fill: 'var(--color-chart-3)' },
  { name: 'Entertainment', value: 13, fill: 'var(--color-chart-4)' },
  { name: 'Utilities', value: 10, fill: 'var(--color-chart-5)' },
  { name: 'Other', value: 5, fill: 'var(--color-chart-1)' },
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
  { month: 'Aug', clients: 8, onTrack: 6 },
  { month: 'Sep', clients: 9, onTrack: 7 },
  { month: 'Oct', clients: 9, onTrack: 6 },
  { month: 'Nov', clients: 10, onTrack: 7 },
  { month: 'Dec', clients: 11, onTrack: 8 },
  { month: 'Jan', clients: 12, onTrack: 6 },
]

export const budgetHealthData = [
  { level: 'On Track', count: 6, percentage: 50, fill: 'var(--color-chart-2)' },
  { level: 'At Risk',  count: 3, percentage: 25, fill: 'var(--color-chart-4)' },
  { level: 'Over Budget', count: 3, percentage: 25, fill: 'var(--color-chart-1)' },
]

// Recent activities
export const recentActivities: Activity[] = [
  {
    id: 'ACT001',
    type: 'transaction',
    title: 'Large deposit received',
    description: 'Michael Chen deposited £250,000',
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
    title: 'Overspending alert flagged',
    description: 'Robert Thompson exceeded their monthly budget by 12%',
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
    type: 'meeting',
    title: 'Budget review completed',
    description: 'David Kim reviewed spending goals with adviser',
    timestamp: '2024-01-13T10:30:00',
    clientId: 'CLT004',
    clientName: 'David Kim',
  },
  {
    id: 'ACT006',
    type: 'transaction',
    title: 'Large expense logged',
    description: 'Thomas Anderson logged a £1,200 home repair expense',
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
    title: 'Over Budget',
    message: 'Robert Thompson has exceeded their monthly budget — groceries up 34%',
    clientId: 'CLT006',
    clientName: 'Robert Thompson',
    timestamp: '2024-01-15T08:00:00',
  },
  {
    id: 'ALT002',
    type: 'danger',
    title: 'Spending Spike',
    message: 'Michael Chen — dining and takeaway spend doubled this week',
    clientId: 'CLT002',
    clientName: 'Michael Chen',
    timestamp: '2024-01-14T09:00:00',
  },
  {
    id: 'ALT003',
    type: 'info',
    title: 'Budget Review Due',
    message: 'Elizabeth Harper is due her quarterly budget review',
    clientId: 'CLT003',
    clientName: 'Elizabeth Harper',
    timestamp: '2024-01-13T12:00:00',
  },
]

export const topClients = mockClients
  .filter(c => c.status === 'active')
  .sort((a, b) => {
    const order = { over_budget: 0, at_risk: 1, on_track: 2 }
    const diff = order[a.budgetHealth] - order[b.budgetHealth]
    if (diff !== 0) return diff
    return b.monthlyBudget - a.monthlyBudget
  })
  .slice(0, 5)
  .map(client => {
    const seed = client.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    const budgetVariance = client.budgetHealth === 'over_budget'
      ? -(5 + (seed % 20))
      : client.budgetHealth === 'at_risk'
      ? 2 + (seed % 8)
      : 10 + (seed % 15)
    return { ...client, budgetVariance }
  })
