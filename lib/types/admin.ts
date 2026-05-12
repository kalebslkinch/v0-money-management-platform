// Client Types
export interface Client {
  id: string
  name: string
  email: string
  phone: string
  portfolioValue: number
  riskLevel: 'low' | 'moderate' | 'high'
  status: 'active' | 'inactive' | 'pending'
  joinedDate: string
  lastActivity: string
  advisor: string
  avatar?: string
}

// Transaction Types
export type TransactionType = 'deposit' | 'withdrawal' | 'buy' | 'sell' | 'fee' | 'dividend'
export type TransactionStatus = 'completed' | 'pending' | 'failed'

export interface Transaction {
  id: string
  clientId: string
  clientName: string
  type: TransactionType
  amount: number
  asset?: string
  date: string
  status: TransactionStatus
  description?: string
}

// Portfolio Types
export type AssetType = 'stock' | 'bond' | 'etf' | 'cash' | 'crypto' | 'real-estate'

export interface Holding {
  asset: string
  ticker?: string
  type: AssetType
  value: number
  allocation: number
  change: number
  shares?: number
}

export interface PortfolioPerformance {
  daily: number
  weekly: number
  monthly: number
  yearly: number
}

export interface Portfolio {
  clientId: string
  totalValue: number
  holdings: Holding[]
  performance: PortfolioPerformance
}

// Analytics Types
export interface RevenueData {
  month: string
  revenue: number
  fees: number
  commissions: number
}

export interface ClientGrowthData {
  month: string
  clients: number
  aum: number
}

export interface RiskDistribution {
  level: 'low' | 'moderate' | 'high'
  count: number
  percentage: number
}

// Dashboard KPI Types
export interface KPIData {
  totalAUM: number
  aumChange: number
  activeClients: number
  clientsChange: number
  monthlyRevenue: number
  revenueChange: number
  avgReturn: number
  returnChange: number
}

// Activity Types
export interface Activity {
  id: string
  type: 'client_added' | 'transaction' | 'alert' | 'meeting' | 'document'
  title: string
  description: string
  timestamp: string
  clientId?: string
  clientName?: string
}

// Alert Types
export interface Alert {
  id: string
  type: 'warning' | 'danger' | 'info'
  title: string
  message: string
  clientId?: string
  clientName?: string
  timestamp: string
}
