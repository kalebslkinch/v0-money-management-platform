import type { UserRole } from '@/lib/auth/user-context'

export type Permission =
  | 'viewDashboard'
  | 'viewClients'
  | 'viewAllClients'
  | 'viewAnalytics'
  | 'viewTransactions'
  | 'viewPortfolios'
  | 'manageClientRecords'
  | 'customizeDashboard'
  | 'manageTeam'
  | 'manageTasks'
  | 'viewClientFinancialSummary'

const ROLE_PERMISSIONS: Record<UserRole, Record<Permission, boolean>> = {
  manager: {
    viewDashboard: true,
    viewClients: true,
    viewAllClients: true,
    viewAnalytics: true,
    viewTransactions: true,
    viewPortfolios: true,
    manageClientRecords: true,
    customizeDashboard: true,
    manageTeam: true,
    manageTasks: true,
    viewClientFinancialSummary: true,
  },
  fa: {
    viewDashboard: true,
    viewClients: true,
    viewAllClients: false,
    viewAnalytics: true,
    viewTransactions: true,
    viewPortfolios: true,
    manageClientRecords: false,
    customizeDashboard: false,
    manageTeam: false,
    manageTasks: false,
    viewClientFinancialSummary: true,
  },
  customer: {
    viewDashboard: true,
    viewClients: false,
    viewAllClients: false,
    viewAnalytics: false,
    viewTransactions: true,
    viewPortfolios: true,
    manageClientRecords: false,
    customizeDashboard: false,
    manageTeam: false,
    manageTasks: false,
    viewClientFinancialSummary: false,
  },
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role][permission]
}
