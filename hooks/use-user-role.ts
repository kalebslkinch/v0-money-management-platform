import { useEffect, useMemo, useState } from 'react'
import {
  createDefaultUser,
  PMFS_USER_STORAGE_KEY,
  parseStoredUser,
  type CurrentUser,
} from '@/lib/auth/user-context'
import { hasPermission, type Permission } from '@/lib/auth/role-permissions'

function readCurrentUser(): CurrentUser {
  if (typeof window === 'undefined') {
    return createDefaultUser()
  }

  const parsed = parseStoredUser(localStorage.getItem(PMFS_USER_STORAGE_KEY))
  return parsed ?? createDefaultUser()
}

export function writeCurrentUser(user: CurrentUser): void {
  if (typeof window === 'undefined') return

  localStorage.setItem(
    PMFS_USER_STORAGE_KEY,
    JSON.stringify({
      ...user,
      lastUpdated: Date.now(),
    }),
  )
}

export function useUserRole() {
  const [user, setUser] = useState<CurrentUser>(readCurrentUser)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const nextUser = readCurrentUser()
    setUser(nextUser)
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === PMFS_USER_STORAGE_KEY) {
        setUser(readCurrentUser())
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const role = useMemo(() => user.role, [user.role])

  return {
    user,
    role,
    isHydrated,
  }
}

export function useUserPermission(permission: Permission): boolean {
  const { role } = useUserRole()
  return hasPermission(role, permission)
}
