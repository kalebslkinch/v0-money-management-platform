'use client'

import { Bell, Search, Command } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface AdminHeaderProps {
  title: string
  breadcrumbs?: { label: string; href?: string }[]
}

function roleLabel(role: UserRole): string {
  if (role === 'manager') return 'Manager'
  if (role === 'fa') return 'Financial Advisor'
  return 'Customer'
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { role } = useUserRole()

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 px-6 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
      
      <h1 className="text-lg font-semibold hidden sm:block">{title}</h1>
      
      <div className="flex-1 flex items-center justify-end gap-4">
        <div className="relative max-w-md w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 pr-12 h-10 bg-accent/50 border-0 rounded-xl placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary/50"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="size-3" />K
          </kbd>
        </div>

        {/* Live indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-chart-2/10 border border-chart-2/20">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-2 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-2 bg-chart-2"></span>
          </span>
          <span className="text-xs font-medium text-chart-2">Live</span>
        </div>

        <Badge variant="outline" className="hidden md:inline-flex rounded-full px-3 py-1 text-xs">
          {roleLabel(role)}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-accent">
              <Bell className="size-[18px] text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Badge variant="secondary" className="text-[10px]">3 new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-chart-2" />
                <span className="font-medium text-sm">Large deposit detected</span>
              </div>
              <span className="text-xs text-muted-foreground pl-4">Client Sarah Chen - $250,000</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-warning" />
                <span className="font-medium text-sm">Risk alert</span>
              </div>
              <span className="text-xs text-muted-foreground pl-4">Portfolio rebalancing needed</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                <span className="font-medium text-sm">New client onboarded</span>
              </div>
              <span className="text-xs text-muted-foreground pl-4">Michael Roberts - Aggressive profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-primary cursor-pointer justify-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
