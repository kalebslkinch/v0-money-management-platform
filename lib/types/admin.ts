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
  advisorId: string
  avatar?: string
}

// Advisor Types
export type AdvisorRole = 'senior_advisor' | 'advisor' | 'junior_advisor'
export type AdvisorStatus = 'active' | 'on_leave' | 'inactive'

export interface AdvisorPerformance {
  monthly: number
  quarterly: number
  yearly: number
}

export interface Advisor {
  id: string
  name: string
  email: string
  phone: string
  role: AdvisorRole
  status: AdvisorStatus
  joinDate: string
  clientIds: string[]
  totalAUM: number
  performance: AdvisorPerformance
  activeCaseCount: number
  avatar?: string
}

// Case Types
export type CaseType = 'onboarding' | 'annual_review' | 'compliance' | 'complaint' | 'rebalance' | 'kyc_update' | 'general'
export type CaseStatus = 'open' | 'in_progress' | 'pending_review' | 'resolved' | 'escalated'
export type CasePriority = 'low' | 'medium' | 'high' | 'critical'
export type CaseNoteType = 'comment' | 'status_change' | 'escalation'

export interface CaseNote {
  id: string
  caseId: string
  authorName: string
  content: string
  createdAt: string
  type: CaseNoteType
}

export interface Case {
  id: string
  clientId: string
  clientName: string
  advisorId: string
  advisorName: string
  type: CaseType
  status: CaseStatus
  priority: CasePriority
  title: string
  description: string
  createdAt: string
  updatedAt: string
  dueDate: string
  notes: CaseNote[]
  createdBy: string
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

// ─── Team-level anonymised insight types ─────────────────────────────────────

/** Budget adherence summary for a named cohort (advisor team or risk tier) */
export interface CohortBudgetSummary {
  /** Human-readable label, e.g. "ADV001 Team" or "High Risk" */
  label: string
  /** Total number of clients in cohort */
  clientCount: number
  /** Clients whose projected spend ≤ total budget */
  onTrackCount: number
  /** Percentage on track (0-100) */
  onTrackPct: number
  /** Total weekly budget across cohort */
  totalBudget: number
  /** Total spent so far this week */
  totalSpent: number
  /** Total projected end-of-week spend */
  totalProjected: number
  /** Average income utilisation percentage (spent / availableToSpend * 100) */
  avgIncomeUtilisation: number
}

/** Per-category pressure across a set of snapshots */
export interface CategoryPressurePoint {
  category: string
  /** Total budget across all clients in scope */
  totalBudget: number
  /** Total projected spend */
  totalProjected: number
  /** Over-budget ratio: (projected - budget) / budget, can be negative (under) */
  overspendRatio: number
  /** Count of clients projected to exceed this category budget */
  overBudgetCount: number
}

/** One point on the team budget health trend (week-over-week) */
export interface TeamHealthTrendPoint {
  weekLabel: string
  /** Advisor 1 team on-track percentage */
  adv001Pct: number
  /** Advisor 2 team on-track percentage */
  adv002Pct: number
  /** Overall team on-track percentage */
  overallPct: number
}

/** Top-level shape consumed by the team insights UI */
export interface TeamInsightData {
  advisorTeams: CohortBudgetSummary[]
  riskCohorts: CohortBudgetSummary[]
  categoryPressure: CategoryPressurePoint[]
  healthTrend: TeamHealthTrendPoint[]
  overallOnTrackPct: number
  totalClientsAnalysed: number
  topPressureCategory: string
}
