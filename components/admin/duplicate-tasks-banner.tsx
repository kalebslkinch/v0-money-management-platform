'use client'

/**
 * Duplicate task / overdue task detector banner (SRD-M14).
 *
 * - Surfaces duplicate task records (same normalised title + assignee) so the
 *   manager can clean them up.
 * - Calls out overdue active tasks. (Reminder notifications are emitted by
 *   use-reminder-scheduler – this banner is the in-page surface.)
 *
 * The banner is non-intrusive: collapses to nothing when there is nothing to
 * report.
 */

import { useMemo } from 'react'
import { AlertTriangle, ListChecks } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TaskRecord } from '@/lib/types/store'

interface DuplicateTasksBannerProps {
  tasks: TaskRecord[]
}

interface DuplicateGroup {
  key: string
  title: string
  assigneeName: string
  ids: string[]
}

function normalise(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ')
}

function findDuplicateGroups(tasks: TaskRecord[]): DuplicateGroup[] {
  const buckets = new Map<string, DuplicateGroup>()
  for (const task of tasks) {
    if (task.status === 'completed' || task.status === 'cancelled') continue
    const titleKey = normalise(task.title)
    if (!titleKey) continue
    const assigneeKey = task.assigneeId ?? 'unassigned'
    const key = `${assigneeKey}::${titleKey}`
    const existing = buckets.get(key)
    if (existing) {
      existing.ids.push(task.id)
    } else {
      buckets.set(key, {
        key,
        title: task.title.trim(),
        assigneeName: task.assigneeName ?? 'Unassigned',
        ids: [task.id],
      })
    }
  }
  return [...buckets.values()].filter(group => group.ids.length > 1)
}

function findOverdueTasks(tasks: TaskRecord[]): TaskRecord[] {
  const today = new Date().toISOString().slice(0, 10)
  return tasks.filter(task => {
    if (task.status === 'completed' || task.status === 'cancelled') return false
    if (!task.dueDate) return false
    return task.dueDate.slice(0, 10) < today
  })
}

export function DuplicateTasksBanner({ tasks }: DuplicateTasksBannerProps) {
  const duplicates = useMemo(() => findDuplicateGroups(tasks), [tasks])
  const overdue = useMemo(() => findOverdueTasks(tasks), [tasks])

  if (duplicates.length === 0 && overdue.length === 0) return null

  return (
    <Card className="rounded-2xl border-warning/30 bg-warning/5">
      <CardContent className="p-4 space-y-3">
        {overdue.length > 0 && (
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-4 text-warning mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0 text-sm">
              <p className="font-medium">
                {overdue.length} overdue {overdue.length === 1 ? 'task' : 'tasks'}
              </p>
              <p className="text-muted-foreground text-xs">
                {overdue
                  .slice(0, 3)
                  .map(task => `"${task.title}"${task.assigneeName ? ` · ${task.assigneeName}` : ''}`)
                  .join('  ·  ')}
                {overdue.length > 3 && ` · +${overdue.length - 3} more`}
              </p>
            </div>
          </div>
        )}

        {duplicates.length > 0 && (
          <div className="flex items-start gap-3">
            <ListChecks className="size-4 text-warning mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0 text-sm space-y-1">
              <p className="font-medium">
                {duplicates.length} possible duplicate {duplicates.length === 1 ? 'task' : 'tasks'} detected
              </p>
              <div className="flex flex-wrap gap-2">
                {duplicates.slice(0, 4).map(group => (
                  <Badge
                    key={group.key}
                    variant="outline"
                    className="text-[10px] gap-1 bg-background"
                  >
                    {group.title}
                    <span className="text-muted-foreground">
                      ×{group.ids.length} · {group.assigneeName}
                    </span>
                  </Badge>
                ))}
                {duplicates.length > 4 && (
                  <Badge variant="outline" className="text-[10px] bg-background">
                    +{duplicates.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
