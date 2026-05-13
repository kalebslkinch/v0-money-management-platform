'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useUserRole } from '@/hooks/use-user-role'
import type { UserRole } from '@/lib/auth/user-context'

interface RouteGuardProps {
  allowedRoles: UserRole[]
  fallbackPath?: string
  children: ReactNode
}

export function RouteGuard({
  allowedRoles,
  fallbackPath = '/admin',
  children,
}: RouteGuardProps) {
  const router = useRouter()
  const { role, isHydrated } = useUserRole()

  const hasAccess = allowedRoles.includes(role)

  useEffect(() => {
    if (!isHydrated || hasAccess) return
    router.replace(fallbackPath)
  }, [fallbackPath, hasAccess, isHydrated, router])

  if (!isHydrated) return null
  if (!hasAccess) return null

  return <>{children}</>
}
