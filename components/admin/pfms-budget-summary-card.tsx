'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { PFMSCustomerSnapshot } from '@/lib/types/pfms'

interface Props {
  snapshot: PFMSCustomerSnapshot
}

export function PFMSBudgetSummaryCard({ snapshot }: Props) {
  const spendUsed      = snapshot.categories.reduce((sum, c) => sum + c.spent, 0)
  const spendProjected = snapshot.categories.reduce((sum, c) => sum + c.projectedSpend, 0)
  const remaining          = snapshot.availableToSpend - spendUsed
  const remainingProjected = snapshot.availableToSpend - spendProjected
  const spentPct = Math.round((spendUsed / snapshot.availableToSpend) * 100)

  const topCategory = [...snapshot.categories].sort((a, b) => b.spent - a.spent)[0]
  const topCategoryOver = topCategory ? topCategory.projectedSpend > topCategory.weeklyBudget : false

  const metrics = [
    {
      label: 'Spent this week',
      value: `£${spendUsed.toFixed(0)}`,
      badge: `${spentPct}% of budget`,
      positive: spentPct <= 80,
    },
    {
      label: 'Remaining',
      value: `£${remaining.toFixed(0)}`,
      badge: remainingProjected >= 0
        ? `£${remainingProjected.toFixed(0)} projected left`
        : `£${Math.abs(remainingProjected).toFixed(0)} over pace`,
      positive: remainingProjected >= 0,
    },
    {
      label: 'Top category',
      value: topCategory?.label ?? '—',
      badge: topCategory ? `£${topCategory.spent.toFixed(0)} spent` : '—',
      positive: !topCategoryOver,
    },
    {
      label: 'End-of-week forecast',
      value: `£${spendProjected.toFixed(0)}`,
      badge: spendProjected <= snapshot.availableToSpend ? 'Within budget' : 'Over budget',
      positive: spendProjected <= snapshot.availableToSpend,
    },
  ]

  return (
    <Card className="p-0 border rounded-2xl relative overflow-hidden">
      <CardContent className="p-0">
        <div className="ps-6 pe-[220px] py-5 flex flex-col gap-7">
          <div>
            <p className="text-base font-semibold text-card-foreground">{snapshot.weekLabel}</p>
            <p className="text-xs text-muted-foreground">Your weekly budget at a glance</p>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            {metrics.map((m, i) => (
              <div key={m.label} className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{m.label}</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-2xl font-semibold text-card-foreground leading-none">{m.value}</p>
                    <Badge
                      className={cn(
                        'font-normal text-muted-foreground text-[11px]',
                        m.positive ? 'bg-teal-400/10' : 'bg-red-500/10',
                      )}
                    >
                      {m.badge}
                    </Badge>
                  </div>
                </div>
                {i < metrics.length - 1 && (
                  <Separator orientation="vertical" className="h-12" />
                )}
              </div>
            ))}
          </div>
        </div>
        <img
          src="https://images.shadcnspace.com/assets/backgrounds/stats-01.webp"
          alt=""
          width={211}
          height={168}
          className="absolute bottom-0 right-0 hidden sm:block pointer-events-none select-none"
          aria-hidden="true"
        />
      </CardContent>
    </Card>
  )
}
