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
  Zap,
  FileText,
  MessagesSquare,
  ClipboardList,
  Gauge,
  ShieldCheck,
  UserCog,
  CheckSquare,
  HeartPulse,
  BookOpen,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

// ─── Nav grouped by task type ─────────────────────────────────────────────────
// Hick's Law: the user first picks a group (≤4 choices), then an item within it
// (≤5 choices). This is far cheaper than scanning 13 items in a flat list.

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  label: string | null  // null = no visible label (primary group)
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Clients & Work',
    items: [
      { title: 'Clients',       url: '/admin/clients',       icon: Users },
      { title: 'Requests',      url: '/admin/requests',      icon: MessagesSquare },
      { title: 'Consultations', url: '/admin/consultations', icon: ClipboardList },
      { title: 'Tasks',         url: '/admin/tasks',         icon: CheckSquare },
      { title: 'Messages',      url: '/admin/messages',      icon: MessagesSquare },
      { title: 'Team',          url: '/admin/staff',         icon: UserCog },
      { title: 'Team Health',   url: '/admin/team-health',   icon: HeartPulse },
      { title: 'Learning Hub',  url: '/admin/learning',      icon: BookOpen },
    ],
  },
  {
    label: 'Finance & Data',
    items: [
      { title: 'Budgets',       url: '/admin/portfolios',    icon: PieChart },
      { title: 'Transactions',  url: '/admin/transactions',  icon: ArrowLeftRight },
      { title: 'Analytics',     url: '/admin/analytics',     icon: BarChart3 },
      { title: 'Performance',   url: '/admin/performance',   icon: Gauge },
      { title: 'Reports',       url: '/admin/reports',       icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [
      { title: 'Privacy',  url: '/admin/privacy',  icon: ShieldCheck },
      { title: 'Settings', url: '/admin/settings', icon: Settings },
    ],
  },
]

function roleSubtitle(role: UserRole): string {
  if (role === 'manager') return 'Manager'
  if (role === 'fa') return 'Financial Advisor'
  return 'Customer'
}

/** Returns true if this nav item should be visible for the given role */
function isItemVisible(url: string, role: UserRole): boolean {
  if (url === '/admin/clients')       return hasPermission(role, 'viewClients')
  if (url === '/admin/analytics')     return hasPermission(role, 'viewAnalytics')
  if (url === '/admin/transactions')  return hasPermission(role, 'viewTransactions')
  if (url === '/admin/portfolios')    return hasPermission(role, 'viewPortfolios')
  if (url === '/admin/performance')   return role === 'manager'
  if (url === '/admin/consultations') return role === 'manager' || role === 'fa'
  if (url === '/admin/staff')         return role === 'manager'
  if (url === '/admin/tasks')         return role === 'manager'
  if (url === '/admin/team-health')   return role === 'manager'
  if (url === '/admin/messages')      return role === 'manager' || role === 'fa'
  if (url === '/admin/learning')      return role === 'manager' || role === 'fa'
  return true
}

/** Role-aware label overrides for customer-facing items */
function resolveTitle(title: string, url: string, role: UserRole): string {
  if (role !== 'customer') return title
  if (url === '/admin/portfolios')   return 'Budgets'
  if (url === '/admin/transactions') return 'Spending'
  if (url === '/admin/requests')     return 'My Requests'
  if (url === '/admin/reports')      return 'My Reports'
  return title
}

export function AdminSidebar() {
  const { pathname } = useRouter()
  const { user, isHydrated } = useUserRole()
  const effectiveRole: UserRole = isHydrated ? user.role : 'manager'
  const effectiveName = isHydrated ? user.name : 'James Wilson'

  const isActive = (url: string) =>
    url === '/admin' ? pathname === '/admin' : pathname.startsWith(url)

  // Filter each group to role-visible items, drop empty groups
  const visibleGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items
      .filter(item => isItemVisible(item.url, effectiveRole))
      .map(item => ({
        ...item,
        title: resolveTitle(item.title, item.url, effectiveRole),
      })),
  })).filter(group => group.items.length > 0)

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-lg glow-primary">
                  <Zap className="size-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col leading-none gap-0.5">
                  <span className="text-lg font-bold tracking-tight">Alpha Finance</span>
                  <span className="text-[9px] uppercase tracking-wide text-muted-foreground leading-[1.3]">
                    Personal Finance<br />Management System
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {visibleGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.label ?? '__primary'} className={groupIndex > 0 ? 'pt-1' : ''}>
            {group.label && (
              <SidebarGroupLabel className="px-2 mb-1 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map(item => {
                  const active = isActive(item.url)
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className={`
                          h-9 rounded-xl transition-all duration-200
                          ${active
                            ? 'bg-primary/10 text-primary shadow-sm border border-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          }
                        `}
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon className={`size-[17px] shrink-0 ${active ? 'text-primary' : ''}`} />
                          <span className="font-medium text-sm">{item.title}</span>
                          {active && (
                            <div className="ml-auto size-1.5 rounded-full bg-primary" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="rounded-xl bg-accent/50 p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="hover:bg-transparent">
                <Avatar className="size-9 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-primary-foreground text-xs font-semibold">
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
