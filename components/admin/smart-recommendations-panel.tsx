'use client'

/**
 * Smart recommendations panel (SRD-M16).
 *
 * Reads the per-advisor performance snapshots already computed on the
 * Performance page and emits actionable recommendations:
 *
 *   • Recognition – top performer above team average on satisfaction
 *   • Training    – advisers with completion rate or response time
 *                   significantly below the team average
 *   • Coaching    – advisers carrying disproportionate open case load
 *   • Mentoring   – pair a high performer with a struggling adviser
 *
 * The component is read-only; it does not write back to the store.
 */

import {
  Award,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  TrendingDown,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AdvisorPerformanceSnapshot } from '@/lib/types/store'

interface SmartRecommendationsPanelProps {
  snapshots: AdvisorPerformanceSnapshot[]
}

interface Recommendation {
  id: string
  kind: 'recognition' | 'training' | 'coaching' | 'mentoring'
  advisorName: string
  title: string
  reason: string
  metric: string
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function buildRecommendations(snapshots: AdvisorPerformanceSnapshot[]): Recommendation[] {
  if (snapshots.length === 0) return []

  const avgSat = average(snapshots.map(s => s.satisfactionRate))
  const avgComp = average(snapshots.map(s => s.completionRate))
  const avgResp = average(snapshots.map(s => s.avgResponseTimeHours))
  const avgOpen = average(snapshots.map(s => s.openCases))

  const recommendations: Recommendation[] = []

  // ── Recognition (highest satisfaction notably above average) ────────────────
  const topPerformer = [...snapshots]
    .sort((a, b) => b.satisfactionRate - a.satisfactionRate)[0]
  if (topPerformer && topPerformer.satisfactionRate >= avgSat + 5) {
    recommendations.push({
      id: `rec-recognition-${topPerformer.advisorId}`,
      kind: 'recognition',
      advisorName: topPerformer.advisorName,
      title: `Recognise ${topPerformer.advisorName}`,
      reason: 'Sustained client satisfaction above the team average.',
      metric: `${topPerformer.satisfactionRate.toFixed(0)}% vs team avg ${avgSat.toFixed(0)}%`,
    })
  }

  for (const snapshot of snapshots) {
    // ── Training (low completion rate) ────────────────────────────────────────
    if (snapshot.completionRate < avgComp - 8) {
      recommendations.push({
        id: `rec-train-comp-${snapshot.advisorId}`,
        kind: 'training',
        advisorName: snapshot.advisorName,
        title: `Workflow training for ${snapshot.advisorName}`,
        reason: 'Case completion rate is materially below the team average – a refresher on case lifecycle would help.',
        metric: `${snapshot.completionRate.toFixed(0)}% vs team avg ${avgComp.toFixed(0)}%`,
      })
    }

    // ── Training (slow response time) ─────────────────────────────────────────
    if (avgResp > 0 && snapshot.avgResponseTimeHours > avgResp * 1.4) {
      recommendations.push({
        id: `rec-train-resp-${snapshot.advisorId}`,
        kind: 'training',
        advisorName: snapshot.advisorName,
        title: `Response-time coaching for ${snapshot.advisorName}`,
        reason: 'Average response time exceeds the team baseline by 40% or more.',
        metric: `${snapshot.avgResponseTimeHours.toFixed(1)}h vs team avg ${avgResp.toFixed(1)}h`,
      })
    }

    // ── Coaching (workload imbalance) ─────────────────────────────────────────
    if (snapshot.openCases > avgOpen * 1.5) {
      recommendations.push({
        id: `rec-coach-${snapshot.advisorId}`,
        kind: 'coaching',
        advisorName: snapshot.advisorName,
        title: `Rebalance workload for ${snapshot.advisorName}`,
        reason: 'Open case load is well above the team average – consider reassignment.',
        metric: `${snapshot.openCases} open vs team avg ${avgOpen.toFixed(1)}`,
      })
    }
  }

  // ── Mentoring pair ──────────────────────────────────────────────────────────
  if (snapshots.length >= 2 && topPerformer) {
    const struggler = [...snapshots]
      .filter(s => s.advisorId !== topPerformer.advisorId)
      .sort((a, b) => a.satisfactionRate - b.satisfactionRate)[0]
    if (struggler && struggler.satisfactionRate < avgSat - 5) {
      recommendations.push({
        id: `rec-mentor-${struggler.advisorId}`,
        kind: 'mentoring',
        advisorName: struggler.advisorName,
        title: `Pair ${struggler.advisorName} with ${topPerformer.advisorName}`,
        reason: 'A short mentoring rotation can lift sustained satisfaction.',
        metric: `${struggler.satisfactionRate.toFixed(0)}% → target ${avgSat.toFixed(0)}%+`,
      })
    }
  }

  return recommendations
}

const KIND_META: Record<Recommendation['kind'], { icon: React.ComponentType<{ className?: string }>; label: string; tone: string }> = {
  recognition: { icon: Award, label: 'Recognition', tone: 'bg-success/10 text-success border-success/20' },
  training: { icon: GraduationCap, label: 'Training', tone: 'bg-warning/10 text-warning border-warning/20' },
  coaching: { icon: TrendingDown, label: 'Coaching', tone: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  mentoring: { icon: HeartHandshake, label: 'Mentoring', tone: 'bg-primary/10 text-primary border-primary/20' },
}

export function SmartRecommendationsPanel({ snapshots }: SmartRecommendationsPanelProps) {
  const recommendations = buildRecommendations(snapshots)

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          Smart recommendations
        </CardTitle>
        <CardDescription>
          Auto-generated training, recognition, and workload suggestions based on the current
          performance snapshot.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No recommendations right now – team metrics look balanced.
          </p>
        ) : (
          recommendations.map(rec => {
            const meta = KIND_META[rec.kind]
            const Icon = meta.icon
            return (
              <div
                key={rec.id}
                className="rounded-lg border p-3 space-y-1 bg-card"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" />
                    <p className="text-sm font-medium">{rec.title}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${meta.tone}`}>
                    {meta.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{rec.reason}</p>
                <p className="text-[11px] text-muted-foreground font-mono">{rec.metric}</p>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
