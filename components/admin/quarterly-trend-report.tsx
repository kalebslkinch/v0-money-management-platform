'use client'

/**
 * Quarterly trend analysis report (SRD-M19).
 *
 * Auto-generates a quarterly trend view from the existing TeamInsightPoint
 * series exposed on the Performance page. Renders three charts (satisfaction,
 * volume, average response time), a short narrative, and a one-click PDF/CSV
 * export via the unified exportData utility (SRD-G06).
 */

import { useMemo, useRef } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarDays, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { exportData } from '@/lib/utils/export'
import type { TeamInsightPoint } from '@/lib/types/store'

interface QuarterlyTrendReportProps {
  insights: TeamInsightPoint[]
}

function quarterLabel(date: Date): string {
  const q = Math.floor(date.getMonth() / 3) + 1
  return `Q${q} ${date.getFullYear()}`
}

function describeTrend(values: number[], unit: string): string {
  if (values.length < 2) return 'Insufficient data for a trend.'
  const first = values[0]
  const last = values[values.length - 1]
  const delta = last - first
  if (Math.abs(delta) < 0.1) return `Held steady (${last.toFixed(1)}${unit}).`
  if (delta > 0) return `Up by ${delta.toFixed(1)}${unit} from ${first.toFixed(1)}${unit} to ${last.toFixed(1)}${unit}.`
  return `Down by ${Math.abs(delta).toFixed(1)}${unit} from ${first.toFixed(1)}${unit} to ${last.toFixed(1)}${unit}.`
}

export function QuarterlyTrendReport({ insights }: QuarterlyTrendReportProps) {
  const satRef = useRef<HTMLDivElement | null>(null)
  const respRef = useRef<HTMLDivElement | null>(null)

  const data = useMemo(() => insights.slice(-3), [insights])
  const label = quarterLabel(new Date())

  const satNarrative = useMemo(
    () => describeTrend(data.map(d => d.avgSatisfaction), '%'),
    [data],
  )
  const respNarrative = useMemo(
    () => describeTrend(data.map(d => d.avgResponseHours), 'h'),
    [data],
  )
  const volumeNarrative = useMemo(
    () => describeTrend(data.map(d => d.totalCases), ''),
    [data],
  )

  function handleExportCsv() {
    exportData({
      filename: `quarterly-trend-${label.replace(' ', '-').toLowerCase()}`,
      rows: data,
      columns: [
        { key: 'month', label: 'Month' },
        { key: 'avgSatisfaction', label: 'Avg satisfaction (%)' },
        { key: 'avgCompletion', label: 'Avg completion (%)' },
        { key: 'avgResponseHours', label: 'Avg response time (h)' },
        { key: 'totalCases', label: 'Total cases' },
      ],
    })
  }

  function handleExportPdf() {
    exportData({
      filename: `quarterly-trend-${label.replace(' ', '-').toLowerCase()}`,
      format: 'pdf',
      rows: data,
      columns: [
        { key: 'month', label: 'Month' },
        { key: 'avgSatisfaction', label: 'Avg satisfaction (%)' },
        { key: 'avgCompletion', label: 'Avg completion (%)' },
        { key: 'avgResponseHours', label: 'Avg response time (h)' },
        { key: 'totalCases', label: 'Total cases' },
      ],
    })
  }

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            Auto-generated quarterly trend report
          </CardTitle>
          <CardDescription>
            <Badge variant="outline" className="mr-2">{label}</Badge>
            Three-month rolling view of satisfaction, response time, and case volume.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={data.length === 0}>
            <Download className="mr-2 size-3.5" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={data.length === 0}>
            <Download className="mr-2 size-3.5" />
            PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No trend data available for the current quarter yet.
          </p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Average satisfaction</p>
                <p className="text-xs text-muted-foreground">{satNarrative}</p>
                <div ref={satRef} className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="avgSatisfaction"
                        stroke="hsl(var(--chart-2))"
                        fill="hsl(var(--chart-2))"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Average response time</p>
                <p className="text-xs text-muted-foreground">{respNarrative}</p>
                <div ref={respRef} className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="avgResponseHours"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-1 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Case volume:</span> {volumeNarrative}
              </p>
              <p>
                Generated automatically from the latest performance snapshot. Exported reports use
                the unified format defined in SRD-G06.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
