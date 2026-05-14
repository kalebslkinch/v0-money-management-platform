'use client'

import { AlertTriangle, ArrowRight, ShoppingBasket, UtensilsCrossed } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { PFMSCustomerSnapshot, PFMSCategoryBudget } from '@/lib/types/pfms'
import { cn } from '@/lib/utils'
import { PFMSBudgetSummaryCard } from '@/components/admin/pfms-budget-summary-card'

interface PFMScustomerDashboardProps {
  snapshot: PFMSCustomerSnapshot
}

function categoryStatus(category: PFMSCategoryBudget): {
  tone: 'healthy' | 'warning' | 'danger'
  message: string
} {
  const usage = (category.spent / category.weeklyBudget) * 100

  if (usage >= 100 || category.projectedSpend > category.weeklyBudget) {
    return {
      tone: 'danger',
      message: 'Over pace for this week',
    }
  }

  if (usage >= 75) {
    return {
      tone: 'warning',
      message: 'Approaching weekly cap',
    }
  }

  return {
    tone: 'healthy',
    message: 'On track this week',
  }
}

export function PFMSCustomerDashboard({ snapshot }: PFMScustomerDashboardProps) {
  const tesco = snapshot.categories.find(category => category.id === 'tesco-grocery')
  const foodDelivery = snapshot.categories.find(category => category.id === 'food-delivery')

  return (
    <div className="space-y-6">
      <PFMSBudgetSummaryCard snapshot={snapshot} />

      <Card>
        <CardHeader>
          <CardTitle>Category Guardrails</CardTitle>
          <CardDescription>
            Stay within weekly plan with special focus on Tesco grocery and food delivery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {snapshot.categories.map(category => {
            const status = categoryStatus(category)
            const usage = Math.min(100, Math.round((category.spent / category.weeklyBudget) * 100))

            return (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {category.id === 'tesco-grocery' ? (
                      <ShoppingBasket className="size-4 text-primary" />
                    ) : category.id === 'food-delivery' ? (
                      <UtensilsCrossed className="size-4 text-warning" />
                    ) : null}
                    <p className="text-sm font-medium">{category.label}</p>
                    {category.essential && (
                      <Badge variant="secondary" className="text-[10px]">Essential</Badge>
                    )}
                  </div>
                  <p className="text-sm tabular-nums">
                    GBP {category.spent.toFixed(0)} / GBP {category.weeklyBudget.toFixed(0)}
                  </p>
                </div>
                <Progress value={usage} className="h-2" />
                <div className="flex items-center justify-between text-xs">
                  <span className={cn(
                    status.tone === 'healthy' && 'text-success',
                    status.tone === 'warning' && 'text-warning',
                    status.tone === 'danger' && 'text-destructive',
                  )}>
                    {status.message}
                  </span>
                  <span className="text-muted-foreground">
                    Projected: GBP {category.projectedSpend.toFixed(0)}
                  </span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tesco + Food Delivery Focus</CardTitle>
            <CardDescription>High-frequency categories that drive weekly outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[tesco, foodDelivery].filter(Boolean).map(category => {
              const item = category as PFMSCategoryBudget
              const overBy = item.projectedSpend - item.weeklyBudget

              return (
                <div key={item.id} className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{item.label}</p>
                    <Badge variant={overBy > 0 ? 'destructive' : 'secondary'}>
                      {overBy > 0 ? `Projected +GBP ${overBy.toFixed(0)}` : 'Projected in budget'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current spend velocity: {Math.round((item.spent / item.weeklyBudget) * 100)}% of weekly cap used.
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Best Actions</CardTitle>
            <CardDescription>One-step adjustments to protect your week-end balance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.nextActions.map(action => (
              <div key={action.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{action.title}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      action.priority === 'high' && 'border-destructive text-destructive',
                      action.priority === 'medium' && 'border-warning text-warning',
                      action.priority === 'low' && 'border-success text-success',
                    )}
                  >
                    {action.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-medium">{action.impact}</span>
                  <button className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    Apply
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            ))}
            {(snapshot.availableToSpend - snapshot.categories.reduce((s, c) => s + c.projectedSpend, 0)) < 0 && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs flex items-start gap-2">
                <AlertTriangle className="size-4 text-destructive mt-0.5" />
                <span>
                  You are projected to overspend this week. Complete one high-priority action today to recover your plan.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
