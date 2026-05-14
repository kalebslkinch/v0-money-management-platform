'use client'

import { Calendar, User, AlignLeft, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { formatDate } from '@/lib/utils/format'
import type { TaskPriority, TaskRecord, TaskStatus } from '@/lib/types/store'

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-muted text-muted-foreground border-muted',
  medium: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  urgent: 'bg-destructive/10 text-destructive border-destructive/20',
}

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

const statusStyles: Record<TaskStatus, string> = {
  open: 'bg-primary/10 text-primary border-primary/20',
  in_progress: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-muted text-muted-foreground border-muted',
}

const statusLabels: Record<TaskStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

interface TaskSheetProps {
  task: TaskRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (task: TaskRecord) => void
  onDelete: (id: string) => void
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="text-sm text-muted-foreground w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm font-medium flex-1">{value ?? '—'}</span>
    </div>
  )
}

export function TaskSheet({
  task,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TaskSheetProps) {
  if (!task) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[440px] overflow-y-auto">
        <SheetHeader className="pb-0">
          <SheetTitle className="sr-only">Task Details</SheetTitle>
          <SheetDescription className="sr-only">Full details for task: {task.title}</SheetDescription>
        </SheetHeader>

        {/* Task header */}
        <div className="pt-6 pb-4 space-y-3">
          <h2 className="text-lg font-semibold leading-snug">{task.title}</h2>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className={priorityStyles[task.priority]}>
              {priorityLabels[task.priority]}
            </Badge>
            <Badge variant="outline" className={statusStyles[task.status]}>
              {statusLabels[task.status]}
            </Badge>
          </div>
        </div>

        {task.description && (
          <>
            <div className="rounded-lg bg-muted/50 border border-border/50 p-3 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                <AlignLeft className="size-3.5" />
                Description
              </div>
              <p className="text-sm whitespace-pre-wrap">{task.description}</p>
            </div>
          </>
        )}

        <Separator />

        {/* Details */}
        <div className="py-4 space-y-1">
          <DetailRow
            label="Assignee"
            value={
              task.assigneeName ? (
                <span className="flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  {task.assigneeName}
                </span>
              ) : (
                <span className="text-muted-foreground">Unassigned</span>
              )
            }
          />
          <DetailRow
            label="Due Date"
            value={
              task.dueDate ? (
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  {formatDate(task.dueDate)}
                </span>
              ) : null
            }
          />
          <DetailRow
            label="Created By"
            value={
              <span className="flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground" />
                {task.createdByName}
              </span>
            }
          />
          <DetailRow label="Record ID" value={<span className="font-mono text-xs">{task.id}</span>} />
          <DetailRow label="Created" value={formatDate(task.createdAt)} />
          <DetailRow label="Last Updated" value={formatDate(task.updatedAt)} />
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            className="flex-1 gap-2"
            onClick={() => {
              onOpenChange(false)
              onEdit(task)
            }}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => {
              onOpenChange(false)
              onDelete(task.id)
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
