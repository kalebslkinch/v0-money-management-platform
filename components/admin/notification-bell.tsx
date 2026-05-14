'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Bell, AlertTriangle, MessagesSquare, Info, AlertOctagon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUserRole } from '@/hooks/use-user-role'
import { useNotifications } from '@/hooks/use-store'
import type { AppNotification, NotificationKind } from '@/lib/types/store'
import { formatRelativeTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

/**
 * Notification dropdown driven by the localStorage notification store.
 * Used to satisfy SRD-M07 (notifications for complaints, adviser requests,
 * and critical events) — visible on all pages via the header.
 */
export function NotificationBell() {
  const { user, isHydrated } = useUserRole()
  const audience = user.role
  const audienceUserId = user.role === 'fa' ? user.advisorId : undefined
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(audience, audienceUserId)

  const sorted = useMemo(
    () => [...notifications].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 10),
    [notifications],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
          className="relative rounded-xl hover:bg-accent"
        >
          <Bell className="size-[18px] text-muted-foreground" />
          {isHydrated && unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span>Notifications</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {unreadCount} new
            </Badge>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sorted.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </div>
        ) : (
          <div className="max-h-80 overflow-auto">
            {sorted.map(item => (
              <NotificationItem key={item.id} item={item} onMarkRead={markRead} />
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const KIND_STYLES: Record<NotificationKind, { dot: string; Icon: React.ComponentType<{ className?: string }> }> = {
  complaint: { dot: 'bg-warning', Icon: AlertTriangle },
  request: { dot: 'bg-primary', Icon: MessagesSquare },
  critical: { dot: 'bg-destructive', Icon: AlertOctagon },
  info: { dot: 'bg-chart-2', Icon: Info },
}

function NotificationItem({
  item,
  onMarkRead,
}: {
  item: AppNotification
  onMarkRead: (id: string) => void
}) {
  const { dot, Icon } = KIND_STYLES[item.kind]
  const content = (
    <div className="flex items-start gap-3 px-3 py-3">
      <span className={cn('mt-1 size-2 rounded-full shrink-0', dot)} aria-hidden />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="size-3.5 text-muted-foreground shrink-0" aria-hidden />
          <p className="font-medium text-sm truncate">{item.title}</p>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{item.message}</p>
        <p className="text-[10px] text-muted-foreground">{formatRelativeTime(item.createdAt)}</p>
      </div>
      {!item.read && <span className="size-1.5 rounded-full bg-primary mt-2" aria-label="Unread" />}
    </div>
  )

  if (item.href) {
    return (
      <Link
        href={item.href}
        onClick={() => onMarkRead(item.id)}
        className={cn(
          'block hover:bg-accent transition-colors',
          !item.read && 'bg-primary/5',
        )}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      onClick={() => onMarkRead(item.id)}
      className={cn('w-full text-left hover:bg-accent transition-colors', !item.read && 'bg-primary/5')}
    >
      {content}
    </button>
  )
}
