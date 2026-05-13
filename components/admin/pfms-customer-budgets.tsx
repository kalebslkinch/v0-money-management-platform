'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { PFMSCustomerSnapshot } from '@/lib/types/pfms'
import { cn } from '@/lib/utils'

interface PFMSCustomerBudgetsProps {
  snapshot: PFMSCustomerSnapshot
}

export function PFMSCustomerBudgets({ snapshot }: PFMSCustomerBudgetsProps) {
  const totalBudget = snapshot.categories.reduce((sum, category) => sum + category.weeklyBudget, 0)
  const totalSpent = snapshot.categories.reduce((sum, category) => sum + category.spent, 0)
  const remaining = totalBudget - totalSpent

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
        <p className="text-muted-foreground">Weekly category limits for everyday spending.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Category Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">GBP {totalBudget.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {snapshot.categories.length} categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Spent So Far</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">GBP {totalSpent.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">{Math.round((totalSpent / totalBudget) * 100)}% of weekly plan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold tabular-nums', remaining < 0 ? 'text-destructive' : 'text-success')}>
              GBP {remaining.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on recorded spending this week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Tesco and food delivery are highlighted due to high spend frequency.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {snapshot.categories.map(category => {
            const usage = Math.min(100, (category.spent / category.weeklyBudget) * 100)
            const projectedGap = category.projectedSpend - category.weeklyBudget
            return (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{category.label}</p>
                    {category.essential && (
                      <Badge variant="secondary" className="text-[10px]">Essential</Badge>
                    )}
                    {(category.id === 'tesco-grocery' || category.id === 'food-delivery') && (
                      <Badge variant="outline" className="text-[10px]">Priority</Badge>
                    )}
                  </div>
                  <p className="text-sm tabular-nums">GBP {category.spent.toFixed(0)} / GBP {category.weeklyBudget.toFixed(0)}</p>
                </div>
                <Progress value={usage} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Projected: GBP {category.projectedSpend.toFixed(0)}</span>
                  <span className={cn(projectedGap > 0 ? 'text-destructive' : 'text-success')}>
                    {projectedGap > 0 ? `+GBP ${projectedGap.toFixed(0)} over` : 'On track'}
                  </span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
