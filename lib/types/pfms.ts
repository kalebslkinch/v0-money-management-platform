export type PFMSCategoryId =
  | 'tesco-grocery'
  | 'food-delivery'
  | 'transport'
  | 'subscriptions'
  | 'household'

export interface PFMSCategoryBudget {
  id: PFMSCategoryId
  label: string
  weeklyBudget: number
  spent: number
  projectedSpend: number
  essential: boolean
}

export interface PFMSWeeklyAction {
  id: string
  title: string
  description: string
  impact: string
  priority: 'high' | 'medium' | 'low'
}

export interface PFMSSpendingTransaction {
  id: string
  merchant: string
  categoryId: PFMSCategoryId
  categoryLabel: string
  amount: number
  date: string
  channel: 'card' | 'bank-transfer' | 'direct-debit'
}

export interface PFMSCustomerSnapshot {
  customerId: string
  weekLabel: string
  weeklyIncome: number
  fixedCommitments: number
  availableToSpend: number
  categories: PFMSCategoryBudget[]
  nextActions: PFMSWeeklyAction[]
  recentTransactions: PFMSSpendingTransaction[]
}
