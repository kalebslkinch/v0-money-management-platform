export type UserRole = 'manager' | 'fa' | 'customer'

export interface CurrentUser {
  userId: string
  role: UserRole
  name: string
  email: string
  advisorId?: string
  clientId?: string
  lastUpdated: number
}

export const PMFS_USER_STORAGE_KEY = 'pmfs_user'

export const DEFAULT_USER: CurrentUser = {
  userId: 'manager-default',
  role: 'manager',
  name: 'James Wilson',
  email: 'james.wilson@pmfs.com',
  advisorId: 'ADV001',
  lastUpdated: Date.now(),
}

export function isUserRole(value: unknown): value is UserRole {
  return value === 'manager' || value === 'fa' || value === 'customer'
}

export function parseStoredUser(raw: string | null): CurrentUser | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<CurrentUser>
    if (!parsed || typeof parsed !== 'object') return null
    if (!isUserRole(parsed.role)) return null
    if (!parsed.userId || !parsed.name || !parsed.email) return null

    return {
      userId: parsed.userId,
      role: parsed.role,
      name: parsed.name,
      email: parsed.email,
      advisorId: parsed.advisorId,
      clientId: parsed.clientId,
      lastUpdated: typeof parsed.lastUpdated === 'number' ? parsed.lastUpdated : Date.now(),
    }
  } catch {
    return null
  }
}

export function createDefaultUser(): CurrentUser {
  return {
    ...DEFAULT_USER,
    lastUpdated: Date.now(),
  }
}
