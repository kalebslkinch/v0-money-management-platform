'use client'

/**
 * Recent consultations quick-reference widget (SRD-A11).
 *
 * Lists the most recent consultation records (default 5) with topic, client,
 * date, and a one-line preview of the summary so an adviser can re-orient
 * before their next call. Renders only for advisers and managers.
 */

import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useConsultationRecords } from '@/hooks/use-store'
import { useUserRole } from '@/hooks/use-user-role'
import { formatDate } from '@/lib/utils/format'

interface RecentConsultationsWidgetProps {
  /** Maximum entries to show. Defaults to 5. */
  limit?: number
}

export function RecentConsultationsWidget({ limit = 5 }: RecentConsultationsWidgetProps) {
  const { user, role } = useUserRole()
  const advisorId = role === 'fa' ? user.advisorId : undefined
  const { records } = useConsultationRecords(role === 'manager' ? undefined : advisorId)

  if (role === 'customer') return null

  const ordered = [...records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="size-4 text-primary" />
            Recent consultations
          </CardTitle>
          <CardDescription>
            Quick reference so you can re-orient before the next conversation.
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/consultations">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {ordered.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No consultations recorded yet.
          </p>
        ) : (
          ordered.map(record => (
            <div
              key={record.id}
              className="rounded-lg border bg-muted/20 p-3 space-y-1"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-tight">{record.topic}</p>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {formatDate(record.date)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {record.clientName}
                {role === 'manager' && <> · {record.advisorName}</>}
              </p>
              {record.summary && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {record.summary}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
