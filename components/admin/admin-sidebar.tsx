'use client'

import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  Settings,
  LogOut,
  TrendingUp,
  Zap,
  UserCog,
  FolderKanban,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useUserRole } from '@/hooks/use-user-role'
import { hasPermission } from '@/lib/auth/role-permissions'
import type { UserRole } from '@/lib/auth/user-context'

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Clients',
    url: '/admin/clients',
    icon: Users,
  },
  {
    title: 'Staff',
    url: '/admin/staff',
    icon: UserCog,
  },
  {
    title: 'Cases',
    url: '/admin/cases',
    icon: FolderKanban,
  },
  {
    title: 'Budgets',
    url: '/admin/portfolios',
    icon: PieChart,
  },
  {
    title: 'Transactions',
    url: '/admin/transactions',
    icon: ArrowLeftRight,
  },
  {
    title: 'Analytics',
    url: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    url: '/admin/settings',
    icon: Settings,
  },
]

function roleSubtitle(role: UserRole): string {
  if (role === 'manager') return 'Manager'
  if (role === 'fa') return 'Financial Advisor'
  return 'Customer'
}

export function AdminSidebar() {
  const { pathname } = useRouter()
  const { user, isHydrated } = useUserRole()
  const effectiveRole: UserRole = isHydrated ? user.role : 'manager'
  const effectiveName = isHydrated ? user.name : 'James Wilson'

  const isActive = (url: string) => {
    if (url === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(url)
  }

  const visibleNavigationItems = navigationItems.filter(item => {
    if (item.url === '/admin/clients') {
      return hasPermission(effectiveRole, 'viewClients')
    }

    if (item.url === '/admin/staff') {
      return hasPermission(effectiveRole, 'manageStaff')
    }

    if (item.url === '/admin/cases') {
      return hasPermission(effectiveRole, 'viewCases')
    }

    if (item.url === '/admin/analytics') {
      return hasPermission(effectiveRole, 'viewAnalytics')
    }

    if (item.url === '/admin/transactions') {
      return hasPermission(effectiveRole, 'viewTransactions')
    }

    if (item.url === '/admin/portfolios') {
      return hasPermission(effectiveRole, 'viewPortfolios')
    }

    return true
  })

  const roleAwareNavigationItems = visibleNavigationItems.map(item => {
    if (effectiveRole === 'customer' && item.url === '/admin/portfolios') {
      return { ...item, title: 'Budgets' }
    }

    if (effectiveRole === 'customer' && item.url === '/admin/transactions') {
      return { ...item, title: 'Spending' }
    }

    return item
  })

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg glow-primary">
                  <Zap className="size-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-lg font-bold tracking-tight">Alpha Finance</span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Personal Finance</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {roleAwareNavigationItems.map((item) => {
                const active = isActive(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className={`
                        h-11 rounded-xl transition-all duration-200
                        ${active 
                          ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className={`size-[18px] ${active ? 'text-primary' : ''}`} />
                        <span className="font-medium">{item.title}</span>
                        {active && (
                          <div className="ml-auto size-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats Mini Card */}
        <div className="mt-6 mx-1 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="size-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Weekly Budget Health</span>
          </div>
          <div className="text-2xl font-bold text-foreground">+2.4%</div>
          <div className="text-xs text-chart-2 mt-1">Spending on-track trend</div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="rounded-xl bg-accent/50 p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="hover:bg-transparent">
                <Avatar className="size-9 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xs font-semibold">
                    {effectiveName
                      .split(' ')
                      .map(part => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-none">
                  <span className="font-semibold text-sm">{effectiveName}</span>
                  <span className="text-[11px] text-muted-foreground">{roleSubtitle(effectiveRole)}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Sign Out" 
                className="h-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="size-4" />
                <span className="text-sm">Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}
