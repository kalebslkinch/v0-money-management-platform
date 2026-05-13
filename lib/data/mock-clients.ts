import type { Client } from '@/lib/types/admin'

export const mockClients: Client[] = [
  {
    id: 'CLT001',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '+1 (555) 234-5678',
    portfolioValue: 2450000,
    riskLevel: 'moderate',
    status: 'active',
    joinedDate: '2021-03-15',
    lastActivity: '2024-01-15',
    advisor: 'James Wilson',
    advisorId: 'ADV001',
  },
  {
    id: 'CLT002',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 345-6789',
    portfolioValue: 5800000,
    riskLevel: 'high',
    status: 'active',
    joinedDate: '2019-08-22',
    lastActivity: '2024-01-14',
    advisor: 'Emily Rodriguez',
    advisorId: 'ADV002',
  },
  {
    id: 'CLT003',
    name: 'Elizabeth Harper',
    email: 'elizabeth.harper@email.com',
    phone: '+1 (555) 456-7890',
    portfolioValue: 1200000,
    riskLevel: 'low',
    status: 'active',
    joinedDate: '2022-01-10',
    lastActivity: '2024-01-13',
    advisor: 'James Wilson',
    advisorId: 'ADV001',
  },
  {
    id: 'CLT004',
    name: 'David Kim',
    email: 'david.kim@email.com',
    phone: '+1 (555) 567-8901',
    portfolioValue: 3750000,
    riskLevel: 'moderate',
    status: 'active',
    joinedDate: '2020-06-05',
    lastActivity: '2024-01-12',
    advisor: 'Emily Rodriguez',
    advisorId: 'ADV002',
  },
  {
    id: 'CLT005',
    name: 'Amanda Foster',
    email: 'amanda.foster@email.com',
    phone: '+1 (555) 678-9012',
    portfolioValue: 890000,
    riskLevel: 'low',
    status: 'pending',
    joinedDate: '2024-01-05',
    lastActivity: '2024-01-11',
    advisor: 'James Wilson',
    advisorId: 'ADV001',
  },
  {
    id: 'CLT006',
    name: 'Robert Thompson',
    email: 'robert.thompson@email.com',
    phone: '+1 (555) 789-0123',
    portfolioValue: 4200000,
    riskLevel: 'high',
    status: 'active',
    joinedDate: '2018-11-20',
    lastActivity: '2024-01-10',
    advisor: 'Emily Rodriguez',
    advisorId: 'ADV002',
  },
  {
    id: 'CLT007',
    name: 'Jennifer Walsh',
    email: 'jennifer.walsh@email.com',
    phone: '+1 (555) 890-1234',
    portfolioValue: 1650000,
    riskLevel: 'moderate',
    status: 'active',
    joinedDate: '2021-09-12',
    lastActivity: '2024-01-09',
    advisor: 'James Wilson',
    advisorId: 'ADV001',
  },
  {
    id: 'CLT008',
    name: 'Christopher Lee',
    email: 'christopher.lee@email.com',
    phone: '+1 (555) 901-2345',
    portfolioValue: 980000,
    riskLevel: 'low',
    status: 'inactive',
    joinedDate: '2020-02-28',
    lastActivity: '2023-12-15',
    advisor: 'Emily Rodriguez',
    advisorId: 'ADV002',
  },
  {
    id: 'CLT009',
    name: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    phone: '+1 (555) 012-3456',
    portfolioValue: 3100000,
    riskLevel: 'moderate',
    status: 'active',
    joinedDate: '2019-04-18',
    lastActivity: '2024-01-08',
    advisor: 'James Wilson',
    advisorId: 'ADV001',
  },
  {
    id: 'CLT010',
    name: 'Thomas Anderson',
    email: 'thomas.anderson@email.com',
    phone: '+1 (555) 123-4567',
    portfolioValue: 7500000,
    riskLevel: 'high',
    status: 'active',
    joinedDate: '2017-07-01',
    lastActivity: '2024-01-07',
    advisor: 'Emily Rodriguez',
    advisorId: 'ADV002',
  },
  {
    id: 'CLT011',
    name: 'Patricia Moore',
    email: 'patricia.moore@email.com',
    phone: '+1 (555) 234-5679',
    portfolioValue: 560000,
    riskLevel: 'low',
    status: 'active',
    joinedDate: '2023-05-20',
    lastActivity: '2024-01-06',
    advisor: 'James Wilson',
    advisorId: 'ADV001',
  },
  {
    id: 'CLT012',
    name: 'Daniel Brown',
    email: 'daniel.brown@email.com',
    phone: '+1 (555) 345-6780',
    portfolioValue: 2100000,
    riskLevel: 'moderate',
    status: 'active',
    joinedDate: '2020-10-15',
    lastActivity: '2024-01-05',
    advisor: 'Emily Rodriguez',
    advisorId: 'ADV002',
  },
]

export function getClientById(id: string): Client | undefined {
  return mockClients.find(client => client.id === id)
}

export function getClientsByAdvisor(advisor: string): Client[] {
  return mockClients.filter(client => client.advisor === advisor)
}

export function getClientsByAdvisorId(advisorId: string): Client[] {
  return mockClients.filter(client => client.advisorId === advisorId)
}

export function getClientsByStatus(status: Client['status']): Client[] {
  return mockClients.filter(client => client.status === status)
}

export function getClientsByRiskLevel(riskLevel: Client['riskLevel']): Client[] {
  return mockClients.filter(client => client.riskLevel === riskLevel)
}
