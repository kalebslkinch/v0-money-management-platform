'use client'

import { Bell, Search } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface AdminHeaderProps {
  title: string
  breadcrumbs?: { label: string; href?: string }[]
}

export function AdminHeader({ title, breadcrumbs }: AdminHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-card px-6">
      <SidebarTrigger className="-ml-2" />
      <Separator orientation="vertical" className="h-6" />
      
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbItem key={index}>
                {index < breadcrumbs.length - 1 ? (
                  <>
                    <BreadcrumbLink href={crumb.href || '#'}>
                      {crumb.label}
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      ) : (
        <h1 className="text-lg font-semibold">{title}</h1>
      )}

      <div className="ml-auto flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients, transactions..."
            className="w-64 pl-9 bg-muted/50"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          <Badge 
            className="absolute -right-1 -top-1 size-5 rounded-full p-0 flex items-center justify-center text-[10px]"
          >
            3
          </Badge>
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  )
}
