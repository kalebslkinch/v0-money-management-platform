import {
  PMFS_USER_STORAGE_KEY,
  createDefaultUser,
  parseStoredUser,
  type CurrentUser,
  type UserRole,
} from '@/lib/auth/user-context'

const ROLE_PRESETS: Record<UserRole, Omit<CurrentUser, 'lastUpdated'>> = {
  manager: {
    userId: 'manager-default',
    role: 'manager',
    name: 'James Wilson',
    email: 'james.wilson@pmfs.com',
    advisorId: 'ADV001',
  },
  fa: {
    userId: 'fa-default',
    role: 'fa',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@pmfs.com',
    advisorId: 'ADV002',
  },
  customer: {
    userId: 'customer-default',
    role: 'customer',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    clientId: 'CLT001',
  },
}

function ensureBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getCurrentUser(): CurrentUser {
  if (!ensureBrowser()) return createDefaultUser()
  return parseStoredUser(localStorage.getItem(PMFS_USER_STORAGE_KEY)) ?? createDefaultUser()
}

export function switchUserRole(nextRole: UserRole): CurrentUser {
  const nextUser: CurrentUser = {
    ...ROLE_PRESETS[nextRole],
    lastUpdated: Date.now(),
  }

  if (ensureBrowser()) {
    localStorage.setItem(PMFS_USER_STORAGE_KEY, JSON.stringify(nextUser))
  }

  return nextUser
}

export function resetToDefaultUser(): CurrentUser {
  const defaultUser = createDefaultUser()

  if (ensureBrowser()) {
    localStorage.setItem(PMFS_USER_STORAGE_KEY, JSON.stringify(defaultUser))
  }

  return defaultUser
}
