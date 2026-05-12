import type { Transaction } from '@/lib/types/admin'

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN001',
    clientId: 'CLT001',
    clientName: 'Sarah Mitchell',
    type: 'buy',
    amount: 50000,
    asset: 'AAPL',
    date: '2024-01-15T10:30:00',
    status: 'completed',
    description: 'Apple Inc. stock purchase',
  },
  {
    id: 'TXN002',
    clientId: 'CLT002',
    clientName: 'Michael Chen',
    type: 'deposit',
    amount: 250000,
    date: '2024-01-15T09:15:00',
    status: 'completed',
    description: 'Quarterly deposit',
  },
  {
    id: 'TXN003',
    clientId: 'CLT003',
    clientName: 'Elizabeth Harper',
    type: 'dividend',
    amount: 3200,
    asset: 'VTI',
    date: '2024-01-14T16:00:00',
    status: 'completed',
    description: 'Vanguard Total Stock Market ETF dividend',
  },
  {
    id: 'TXN004',
    clientId: 'CLT004',
    clientName: 'David Kim',
    type: 'sell',
    amount: 85000,
    asset: 'MSFT',
    date: '2024-01-14T11:45:00',
    status: 'completed',
    description: 'Microsoft stock sale',
  },
  {
    id: 'TXN005',
    clientId: 'CLT005',
    clientName: 'Amanda Foster',
    type: 'deposit',
    amount: 100000,
    date: '2024-01-14T08:30:00',
    status: 'pending',
    description: 'Initial account funding',
  },
  {
    id: 'TXN006',
    clientId: 'CLT006',
    clientName: 'Robert Thompson',
    type: 'fee',
    amount: 4200,
    date: '2024-01-13T17:00:00',
    status: 'completed',
    description: 'Quarterly management fee',
  },
  {
    id: 'TXN007',
    clientId: 'CLT007',
    clientName: 'Jennifer Walsh',
    type: 'buy',
    amount: 30000,
    asset: 'BND',
    date: '2024-01-13T14:20:00',
    status: 'completed',
    description: 'Vanguard Bond ETF purchase',
  },
  {
    id: 'TXN008',
    clientId: 'CLT010',
    clientName: 'Thomas Anderson',
    type: 'withdrawal',
    amount: 150000,
    date: '2024-01-12T10:00:00',
    status: 'completed',
    description: 'Scheduled withdrawal',
  },
  {
    id: 'TXN009',
    clientId: 'CLT009',
    clientName: 'Maria Garcia',
    type: 'buy',
    amount: 75000,
    asset: 'GOOGL',
    date: '2024-01-12T09:30:00',
    status: 'completed',
    description: 'Alphabet stock purchase',
  },
  {
    id: 'TXN010',
    clientId: 'CLT002',
    clientName: 'Michael Chen',
    type: 'buy',
    amount: 120000,
    asset: 'NVDA',
    date: '2024-01-11T15:45:00',
    status: 'completed',
    description: 'NVIDIA stock purchase',
  },
  {
    id: 'TXN011',
    clientId: 'CLT001',
    clientName: 'Sarah Mitchell',
    type: 'dividend',
    amount: 1850,
    asset: 'SPY',
    date: '2024-01-11T16:00:00',
    status: 'completed',
    description: 'S&P 500 ETF dividend',
  },
  {
    id: 'TXN012',
    clientId: 'CLT012',
    clientName: 'Daniel Brown',
    type: 'deposit',
    amount: 50000,
    date: '2024-01-10T11:00:00',
    status: 'completed',
    description: 'Monthly contribution',
  },
  {
    id: 'TXN013',
    clientId: 'CLT004',
    clientName: 'David Kim',
    type: 'fee',
    amount: 3750,
    date: '2024-01-10T17:00:00',
    status: 'completed',
    description: 'Quarterly management fee',
  },
  {
    id: 'TXN014',
    clientId: 'CLT006',
    clientName: 'Robert Thompson',
    type: 'buy',
    amount: 200000,
    asset: 'QQQ',
    date: '2024-01-09T10:15:00',
    status: 'completed',
    description: 'Nasdaq 100 ETF purchase',
  },
  {
    id: 'TXN015',
    clientId: 'CLT003',
    clientName: 'Elizabeth Harper',
    type: 'sell',
    amount: 25000,
    asset: 'AMZN',
    date: '2024-01-09T14:30:00',
    status: 'failed',
    description: 'Amazon stock sale - insufficient shares',
  },
]

export function getTransactionsByClientId(clientId: string): Transaction[] {
  return mockTransactions.filter(txn => txn.clientId === clientId)
}

export function getTransactionsByType(type: Transaction['type']): Transaction[] {
  return mockTransactions.filter(txn => txn.type === type)
}

export function getTransactionsByStatus(status: Transaction['status']): Transaction[] {
  return mockTransactions.filter(txn => txn.status === status)
}

export function getRecentTransactions(limit: number = 10): Transaction[] {
  return [...mockTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}
