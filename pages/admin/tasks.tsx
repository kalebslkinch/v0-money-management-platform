'use client'

import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog'
import { CreateTaskDialog } from '@/components/admin/create-task-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RouteGuard } from '@/components/auth/route-guard'
import { useUserRole } from '@/hooks/use-user-role'
import { useTasks, useTeamMembers } from '@/hooks/use-store'
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

function TasksPageInner() {
  const { user } = useUserRole()
  const { tasks, create, update, remove } = useTasks()
  const { teamMembers } = useTeamMembers()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TaskRecord | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return tasks.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
      if (term && !t.title.toLowerCase().includes(term) && !(t.assigneeName ?? '').toLowerCase().includes(term)) return false
      return true
    })
  }, [tasks, search, statusFilter, priorityFilter])

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(task: TaskRecord) {
    setEditing(task)
    setDialogOpen(true)
  }

  const stats = useMemo(() => ({
    total: tasks.length,
    open: tasks.filter(t => t.status === 'open').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }), [tasks])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AdminHeader title="Tasks" subtitle="Create and manage team task records" />

      <main className="flex-1 p-6 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Open', value: stats.open },
            { label: 'In Progress', value: stats.inProgress },
            { label: 'Completed', value: stats.completed },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-5">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Task table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-base">All Tasks</CardTitle>
              <CardDescription>{filtered.length} task{filtered.length !== 1 ? 's' : ''} shown</CardDescription>
            </div>
            <Button size="sm" onClick={openCreate} className="gap-2 shrink-0">
              <Plus className="size-4" />
              New Task
            </Button>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as TaskStatus | 'all')}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={v => setPriorityFilter(v as TaskPriority | 'all')}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        {tasks.length === 0
                          ? 'No tasks yet. Click "New Task" to create one.'
                          : 'No tasks match your filters.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(task => (
                      <TableRow key={task.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[220px]">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={priorityStyles[task.priority]}>
                            {priorityLabels[task.priority]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyles[task.status]}>
                            {statusLabels[task.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {task.assigneeName ?? '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {task.dueDate ? formatDate(task.dueDate) : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {task.createdByName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => openEdit(task)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:text-destructive"
                              onClick={() => setConfirmId(task.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <CreateTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        teamMembers={teamMembers}
        createdById={user.advisorId ?? user.userId ?? 'manager'}
        createdByName={user.name}
        onCreate={input => create(input)}
        onUpdate={(id, patch) => update(id, patch)}
      />

      <ConfirmDeleteDialog
        open={confirmId !== null}
        onOpenChange={open => { if (!open) setConfirmId(null) }}
        title="Delete task"
        description="This will permanently delete this task record. This action cannot be undone."
        onConfirm={() => {
          if (confirmId) remove(confirmId)
          setConfirmId(null)
        }}
      />
    </div>
  )
}

export default function TasksPage() {
  return (
    <RouteGuard allowedRoles={['manager']}>
      <TasksPageInner />
    </RouteGuard>
  )
}
