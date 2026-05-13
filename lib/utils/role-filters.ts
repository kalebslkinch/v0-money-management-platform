import { mockClients } from '@/lib/data/mock-clients'
import { mockPortfolios } from '@/lib/data/mock-portfolios'
import { mockTransactions } from '@/lib/data/mock-transactions'
import type { Client, Portfolio, Transaction } from '@/lib/types/admin'
import type { CurrentUser } from '@/lib/auth/user-context'

function getVisibleClientIds(user: CurrentUser): string[] {
  if (user.role === 'manager') {
    return mockClients.map(client => client.id)
  }

  if (user.role === 'fa') {
    return mockClients
      .filter(client => client.advisorId === user.advisorId)
      .map(client => client.id)
  }

  return user.clientId ? [user.clientId] : []
}

export function getVisibleClients(user: CurrentUser): Client[] {
  if (user.role === 'manager') return mockClients

  if (user.role === 'fa') {
    return mockClients.filter(client => client.advisorId === user.advisorId)
  }

  return user.clientId
    ? mockClients.filter(client => client.id === user.clientId)
    : []
}

export function getVisibleTransactions(user: CurrentUser): Transaction[] {
  const clientIds = new Set(getVisibleClientIds(user))
  return mockTransactions.filter(transaction => clientIds.has(transaction.clientId))
}

export function getVisiblePortfolioClientIds(user: CurrentUser): string[] {
  const visibleClientIds = new Set(getVisibleClientIds(user))
  return Object.keys(mockPortfolios).filter(clientId => visibleClientIds.has(clientId))
}

export function getVisiblePortfolios(user: CurrentUser): Array<{ client: Client; portfolio: Portfolio }> {
  return getVisibleClients(user)
    .filter(client => Boolean(mockPortfolios[client.id]))
    .map(client => ({
      client,
      portfolio: mockPortfolios[client.id],
    }))
}

export function canAccessClient(user: CurrentUser, client: Client): boolean {
  if (user.role === 'manager') return true

  if (user.role === 'fa') {
    return client.advisorId === user.advisorId
  }

  return Boolean(user.clientId) && client.id === user.clientId
}
