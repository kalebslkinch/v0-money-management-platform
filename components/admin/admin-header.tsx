'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useUserRole } from '@/hooks/use-user-role'
import type { UserRole } from '@/lib/auth/user-context'
import { switchUserRole } from '@/lib/auth/dev-role-switcher'
import { HelpDrawer } from '@/components/admin/help-drawer'
import { NotificationBell } from '@/components/admin/notification-bell'
import { GlobalSearch } from '@/components/admin/global-search'


interface AdminHeaderProps {
  title: string
  breadcrumbs?: { label: string; href?: string }[]
}

function roleLabel(role: UserRole): string {
  if (role === 'manager') return 'Manager'
  if (role === 'fa') return 'Financial Advisor'
  return 'Customer'
}


const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'manager', label: 'Manager' },
  { value: 'fa', label: 'Financial Advisor' },
  { value: 'customer', label: 'Customer' },
]

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, breadcrumbs }) => {
  const { role, user, isHydrated } = useUserRole()
  const effectiveRole: UserRole = isHydrated ? role : 'manager'
  const effectiveName = isHydrated ? user.name : 'James Wilson'
  const effectiveEmail = isHydrated ? user.email : 'james.wilson@pmfs.com'

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 px-6 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
      <h1 className="text-lg font-semibold hidden sm:block">{title}</h1>
      <div className="flex-1 flex items-center justify-end gap-4">
        <GlobalSearch />

        {/* Live indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-chart-2/10 border border-chart-2/20">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-2 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-2 bg-chart-2"></span>
          </span>
          <span className="text-xs font-medium text-chart-2">Live</span>
        </div>

        {/* Role/user switcher dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full px-3 py-1 text-xs flex items-center gap-2">
              <span>{effectiveName}</span>
              <Badge variant="secondary">{roleLabel(effectiveRole)}</Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel>Switch User Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ROLE_OPTIONS.map(opt => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => {
                  switchUserRole(opt.value)
                  window.location.reload()
                }}
                className={opt.value === effectiveRole ? 'font-bold bg-accent/50' : ''}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">{effectiveEmail}</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help & Support (SRD-G02) */}
        <HelpDrawer />

        {/* Notifications driven by store (SRD-M07) */}
        <NotificationBell />
      </div>
    </header>
  )
}

export { AdminHeader }
