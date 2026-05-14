'use client'

import { useMemo } from 'react'
import {
  Activity,
  AlertTriangle,
  HeartPulse,
  MessageSquareText,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AdminHeader } from '@/components/admin/admin-header'
import { RouteGuard } from '@/components/auth/route-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { usePerformanceNotes, useTasks } from '@/hooks/use-store'
import { mockAdvisors, getActiveAdvisors } from '@/lib/data/mock-advisors'
import { mockCases } from '@/lib/data/mock-cases'
import { formatDate } from '@/lib/utils/format'

/**
 * Team Health dashboard (SRD-M17).
 *
 * Combines three signals into a single management view:
 *   • Workload    – open cases + active tasks per adviser
 *   • Sentiment   – satisfaction proxy from existing performance data
 *   • Feedback    – the most recent performance / coaching notes
 *
 * Reads from the existing stores; writes nothing. Designed to surface
 * imbalance and burnout signals before they become incidents.
 */
function TeamHealthInner() {
  const advisors = getActiveAdvisors()
  const { tasks } = useTasks()
  const { notes } = usePerformanceNotes()

  const rows = useMemo(() => {
    return advisors.map(advisor => {
      const openCases = mockCases.filter(
        c => c.advisorId === advisor.id && c.status !== 'resolved',
      ).length
      const activeTasks = tasks.filter(
        t => t.assigneeId === advisor.id && t.status !== 'completed' && t.status !== 'cancelled',
      ).length
      // Simple sentiment proxy: satisfaction = 60 + monthly perf*4 (clamped 0-100)
      const satisfaction = Math.max(
        0,
        Math.min(100, 60 + advisor.performance.monthly * 4),
      )
      // Workload index — higher = more loaded
      const workload = openCases + activeTasks
      return {
        advisor,
        openCases,
        activeTasks,
        workload,
        satisfaction,
      }
    })
  }, [advisors, tasks])

  const maxWorkload = Math.max(1, ...rows.map(r => r.workload))
  const teamWorkload = rows.reduce((sum, r) => sum + r.workload, 0)
  const teamAverage = rows.length === 0 ? 0 : teamWorkload / rows.length

  const overloaded = rows.filter(r => r.workload > teamAverage * 1.4)
  const underUtilised = rows.filter(r => r.workload < teamAverage * 0.6 && rows.length > 1)

  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const chartData = rows.map(row => ({
    name: row.advisor.name.split(' ')[0],
    Cases: row.openCases,
    Tasks: row.activeTasks,
  }))

  return (
    <>
      <AdminHeader title="Team Health" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <HeartPulse className="size-5 text-primary" />
              Team Health
            </h1>
            <p className="text-muted-foreground">
              Workload distribution, team sentiment, and the latest coaching feedback in one place.
            </p>
          </div>

          {/* Top-level signals */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active workload (cases + tasks)</CardDescription>
                <CardTitle className="text-3xl">{teamWorkload}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Avg per adviser: {teamAverage.toFixed(1)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Overloaded advisers</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  {overloaded.length}
                  {overloaded.length > 0 && (
                    <AlertTriangle className="size-5 text-warning" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                More than 40% above team average.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Under-utilised advisers</CardDescription>
                <CardTitle className="text-3xl">{underUtilised.length}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Capacity to absorb reassignments.
              </CardContent>
            </Card>
          </div>

          {/* Workload split chart */}
          <Card className="rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                Workload split per adviser
              </CardTitle>
              <CardDescription>
                Open cases and active tasks side-by-side. Use this to spot imbalance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="Cases" stackId="a" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="Tasks" stackId="a" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Per-row breakdown */}
          <Card className="rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="size-4 text-primary" />
                Adviser-level breakdown
              </CardTitle>
              <CardDescription>
                Workload bar plus a sentiment proxy derived from performance trend.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {rows.map(row => (
                <div key={row.advisor.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{row.advisor.name}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {row.advisor.role.replace('_', ' ')}
                      </Badge>
                      {row.workload > teamAverage * 1.4 && (
                        <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/20">
                          Overloaded
                        </Badge>
                      )}
                      {row.workload < teamAverage * 0.6 && rows.length > 1 && (
                        <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">
                          Capacity
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {row.openCases} cases · {row.activeTasks} tasks
                    </span>
                  </div>
                  <Progress value={(row.workload / maxWorkload) * 100} className="h-1.5" />
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    Sentiment proxy
                    <Progress value={row.satisfaction} className="h-1 w-32" />
                    <span className="tabular-nums">{row.satisfaction.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent feedback */}
          <Card className="rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquareText className="size-4 text-primary" />
                Recent feedback
              </CardTitle>
              <CardDescription>
                The latest performance and coaching notes recorded by management.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No feedback recorded yet.
                </p>
              ) : (
                recentNotes.map(note => {
                  const advisor = mockAdvisors.find(a => a.id === note.memberId)
                  return (
                    <div key={note.id} className="rounded-lg border p-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {advisor?.name ?? 'Team member'}
                        </span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {note.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {note.authorName} · {formatDate(note.createdAt)}
                      </p>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

export default function TeamHealthPage() {
  return (
    <RouteGuard allowedRoles={['manager']}>
      <TeamHealthInner />
    </RouteGuard>
  )
}
