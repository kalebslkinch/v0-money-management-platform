import type { Advisor } from '@/lib/types/admin'

export const mockAdvisors: Advisor[] = [
  {
    id: 'ADV001',
    name: 'James Wilson',
    email: 'james.wilson@pmfs.com',
    phone: '+1 (555) 123-4567',
    role: 'senior_advisor',
    status: 'active',
    joinDate: '2018-03-01',
    clientIds: ['CLT001', 'CLT003', 'CLT005', 'CLT007', 'CLT009', 'CLT011'],
    managedBudgetTotal: 11100,
    performance: { monthly: 2.4, quarterly: 6.8, yearly: 14.2 },
    activeCaseCount: 4,
  },
  {
    id: 'ADV002',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@pmfs.com',
    phone: '+1 (555) 234-5678',
    role: 'senior_advisor',
    status: 'active',
    joinDate: '2017-06-15',
    clientIds: ['CLT002', 'CLT004', 'CLT006', 'CLT008', 'CLT010', 'CLT012'],
    managedBudgetTotal: 19200,
    performance: { monthly: 3.1, quarterly: 8.4, yearly: 17.6 },
    activeCaseCount: 5,
  },
  {
    id: 'ADV003',
    name: 'Marcus Hayes',
    email: 'marcus.hayes@pmfs.com',
    phone: '+1 (555) 345-6789',
    role: 'advisor',
    status: 'active',
    joinDate: '2021-09-01',
    clientIds: [],
    managedBudgetTotal: 0,
    performance: { monthly: 1.8, quarterly: 5.2, yearly: 11.4 },
    activeCaseCount: 1,
  },
  {
    id: 'ADV004',
    name: 'Priya Nair',
    email: 'priya.nair@pmfs.com',
    phone: '+1 (555) 456-7890',
    role: 'junior_advisor',
    status: 'on_leave',
    joinDate: '2023-02-20',
    clientIds: [],
    managedBudgetTotal: 0,
    performance: { monthly: 0, quarterly: 3.1, yearly: 8.7 },
    activeCaseCount: 0,
  },
]

export function getAdvisorById(id: string): Advisor | undefined {
  return mockAdvisors.find(a => a.id === id)
}

export function getAdvisorByClientId(clientId: string): Advisor | undefined {
  return mockAdvisors.find(a => a.clientIds.includes(clientId))
}

export function getActiveAdvisors(): Advisor[] {
  return mockAdvisors.filter(a => a.status === 'active')
}
