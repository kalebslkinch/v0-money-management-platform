import type { Transaction } from '@/lib/types/admin'

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN001',
    clientId: 'CLT001',
    clientName: 'Sarah Mitchell',
    type: 'buy',
    amount: 132.48,
    date: '2024-01-15T10:30:00',
    status: 'completed',
    description: 'Tesco groceries and household spend',
  },
  {
    id: 'TXN002',
    clientId: 'CLT002',
    clientName: 'Michael Chen',
    type: 'deposit',
    amount: 2500,
    date: '2024-01-15T09:15:00',
    status: 'completed',
    description: 'Salary credited',
  },
  {
    id: 'TXN003',
    clientId: 'CLT003',
    clientName: 'Elizabeth Harper',
    type: 'dividend',
    amount: 18.75,
    date: '2024-01-14T16:00:00',
    status: 'completed',
    description: 'Card cashback payout',
  },
  {
    id: 'TXN004',
    clientId: 'CLT004',
    clientName: 'David Kim',
    type: 'sell',
    amount: 64.2,
    date: '2024-01-14T11:45:00',
    status: 'completed',
    description: 'Refund from online retailer',
  },
  {
    id: 'TXN005',
    clientId: 'CLT005',
    clientName: 'Amanda Foster',
    type: 'deposit',
    amount: 420,
    date: '2024-01-14T08:30:00',
    status: 'pending',
    description: 'Pending transfer from joint account',
  },
  {
    id: 'TXN006',
    clientId: 'CLT006',
    clientName: 'Robert Thompson',
    type: 'fee',
    amount: 4.2,
    date: '2024-01-13T17:00:00',
    status: 'completed',
    description: 'Card maintenance fee',
  },
  {
    id: 'TXN007',
    clientId: 'CLT007',
    clientName: 'Jennifer Walsh',
    type: 'buy',
    amount: 89.99,
    date: '2024-01-13T14:20:00',
    status: 'completed',
    description: 'Monthly streaming and digital subscriptions',
  },
  {
    id: 'TXN008',
    clientId: 'CLT010',
    clientName: 'Thomas Anderson',
    type: 'withdrawal',
    amount: 145.6,
    date: '2024-01-12T10:00:00',
    status: 'completed',
    description: 'Energy bill payment',
  },
  {
    id: 'TXN009',
    clientId: 'CLT009',
    clientName: 'Maria Garcia',
    type: 'buy',
    amount: 47.35,
    date: '2024-01-12T09:30:00',
    status: 'completed',
    description: 'Fuel and transport spend',
  },
  {
    id: 'TXN010',
    clientId: 'CLT002',
    clientName: 'Michael Chen',
    type: 'buy',
    amount: 215.8,
    date: '2024-01-11T15:45:00',
    status: 'completed',
    description: 'Household essentials and pharmacy',
  },
  {
    id: 'TXN011',
    clientId: 'CLT001',
    clientName: 'Sarah Mitchell',
    type: 'dividend',
    amount: 12.4,
    date: '2024-01-11T16:00:00',
    status: 'completed',
    description: 'Cashback from card rewards',
  },
  {
    id: 'TXN012',
    clientId: 'CLT012',
    clientName: 'Daniel Brown',
    type: 'deposit',
    amount: 950,
    date: '2024-01-10T11:00:00',
    status: 'completed',
    description: 'Freelance invoice payment',
  },
  {
    id: 'TXN013',
    clientId: 'CLT004',
    clientName: 'David Kim',
    type: 'fee',
    amount: 2.99,
    date: '2024-01-10T17:00:00',
    status: 'completed',
    description: 'International transfer fee',
  },
  {
    id: 'TXN014',
    clientId: 'CLT006',
    clientName: 'Robert Thompson',
    type: 'buy',
    amount: 76.14,
    date: '2024-01-09T10:15:00',
    status: 'completed',
    description: 'Dining and takeaway spend',
  },
  {
    id: 'TXN015',
    clientId: 'CLT003',
    clientName: 'Elizabeth Harper',
    type: 'sell',
    amount: 58.0,
    date: '2024-01-09T14:30:00',
    status: 'failed',
    description: 'Refund reversal failed',
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

export function addTransaction(t: Transaction): void {
  mockTransactions.push(t)
}

export function updateTransaction(updated: Transaction): void {
  const idx = mockTransactions.findIndex(t => t.id === updated.id)
  if (idx >= 0) mockTransactions[idx] = updated
}

export function deleteTransaction(id: string): void {
  const idx = mockTransactions.findIndex(t => t.id === id)
  if (idx >= 0) mockTransactions.splice(idx, 1)
}
