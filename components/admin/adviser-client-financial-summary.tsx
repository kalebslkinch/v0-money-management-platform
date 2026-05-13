'use client'

/**
 * AdviserClientFinancialSummary (SRD-A02, SRD-U08, SRD-G04)
 *
 * Renders a client's financial summary for an authorised adviser.
 * Access is conditional on:
 *   1. The caller holding the `viewClientFinancialSummary` permission.
 *   2. The client being assigned to the requesting adviser.
 *   3. The client having granted explicit `shareWithAdvisor` consent.
 *
 * Individual data sections (spending, budgets, transactions) are further
 * filtered by the client's granular consent flags.
 */

import { useMemo } from 'react'
import { Lock, ShieldAlert, UserX } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { resolveAdviserAccess } from '@/lib/services/adviser-financial-access'
import type { UserRole } from '@/lib/auth/user-context'
import type { PFMSCustomerSnapshotWithHistory } from '@/lib/data/mock-pfms'

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdviserClientFinancialSummaryProps {
  /** Authenticated user's role */
  role: UserRole
  /** Authenticated user's adviser id (required when role is 'fa') */
  adviserId: string
  /** The client whose data is being requested */
  clientId: string
  /** Client's display name — shown in headings */
  clientName: string
  /** PFMS snapshot to display if access is granted */
  snapshot: PFMSCustomerSnapshotWithHistory
}

// ─── Access-denied states ──────────────────────────────────────────────────────

function NoPermissionState() {
  return (
    <Alert variant="destructive">
      <ShieldAlert className="size-4" />
      <AlertTitle>Access not permitted</AlertTitle>
      <AlertDescription>
        Your account does not have permission to view client financial summaries.
        Contact your manager if you believe this is incorrect.
      </AlertDescription>
    </Alert>
  )
}

function NotAssignedState({ clientName }: { clientName: string }) {
  return (
    <Alert variant="destructive">
      <UserX className="size-4" />
      <AlertTitle>Client not assigned to you</AlertTitle>
      <AlertDescription>
        {clientName} is not in your client portfolio. You may only view financial
        summaries for clients assigned to you.
      </AlertDescription>
    </Alert>
  )
}

function ConsentDeniedState({ clientName }: { clientName: string }) {
  return (
    <Alert>
      <Lock className="size-4" />
      <AlertTitle>Client consent required</AlertTitle>
      <AlertDescription>
        {clientName} has not yet authorised data sharing with their adviser.
        Financial summary data will appear here once the client grants consent
        from their privacy settings.
      </AlertDescription>
    </Alert>
  )
}

// ─── Summary sections ──────────────────────────────────────────────────────────

function IncomeOverview({ snapshot }: { snapshot: PFMSCustomerSnapshotWithHistory }) {
  const spentTotal = snapshot.categories.reduce((sum, c) => sum + c.spent, 0)
  const projectedTotal = snapshot.categories.reduce((sum, c) => sum + c.projectedSpend, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income &amp; Commitments</CardTitle>
        <CardDescription>{snapshot.weekLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Weekly Income</dt>
            <dd className="font-semibold tabular-nums">GBP {snapshot.weeklyIncome.toFixed(0)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Fixed Commitments</dt>
            <dd className="font-semibold tabular-nums">GBP {snapshot.fixedCommitments.toFixed(0)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Available to Spend</dt>
            <dd className="font-semibold tabular-nums">GBP {snapshot.availableToSpend.toFixed(0)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Spent This Week</dt>
            <dd
              className={cn(
                'font-semibold tabular-nums',
                spentTotal > snapshot.availableToSpend ? 'text-destructive' : undefined,
              )}
            >
              GBP {spentTotal.toFixed(0)}
            </dd>
          </div>
        </dl>
        <Separator className="my-4" />
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Projected week-end spend</span>
            <span
              className={cn(
                'font-medium',
                projectedTotal > snapshot.availableToSpend ? 'text-destructive' : 'text-success',
              )}
            >
              GBP {projectedTotal.toFixed(0)}
            </span>
          </div>
          <Progress
            value={Math.min(100, (projectedTotal / snapshot.availableToSpend) * 100)}
            className={cn(
              projectedTotal > snapshot.availableToSpend ? '[&>div]:bg-destructive' : undefined,
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function BudgetBreakdown({ snapshot }: { snapshot: PFMSCustomerSnapshotWithHistory }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Budgets</CardTitle>
        <CardDescription>Weekly allowances and current pace per category.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {snapshot.categories.map(category => {
          const pct = Math.min(100, (category.spent / category.weeklyBudget) * 100)
          const over = category.projectedSpend > category.weeklyBudget
          return (
            <div key={category.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category.label}</span>
                  {category.essential && (
                    <Badge variant="secondary" className="text-[10px]">Essential</Badge>
                  )}
                  {over && (
                    <Badge variant="destructive" className="text-[10px]">Over pace</Badge>
                  )}
                </div>
                <span className="tabular-nums text-muted-foreground">
                  GBP {category.spent.toFixed(0)} / GBP {category.weeklyBudget.toFixed(0)}
                </span>
              </div>
              <Progress
                value={pct}
                className={cn(over ? '[&>div]:bg-destructive' : pct >= 75 ? '[&>div]:bg-amber-500' : undefined)}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function RecentTransactions({ snapshot }: { snapshot: PFMSCustomerSnapshotWithHistory }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest activity across all spending categories.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Merchant</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshot.recentTransactions.map(tx => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">{tx.merchant}</TableCell>
                <TableCell>{tx.categoryLabel}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {tx.channel.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  GBP {tx.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function AdviserClientFinancialSummary({
  role,
  adviserId,
  clientId,
  clientName,
  snapshot,
}: AdviserClientFinancialSummaryProps) {
  const { canView, noPermission, notAssigned, consentDenied, consent } = useMemo(
    () => resolveAdviserAccess(role, adviserId, clientId),
    [role, adviserId, clientId],
  )

  // ── Access-denied states ──
  if (noPermission) return <NoPermissionState />
  if (notAssigned) return <NotAssignedState clientName={clientName} />
  if (consentDenied) return <ConsentDeniedState clientName={clientName} />

  // canView is true from here
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Financial Summary — {clientName}
          </h2>
          <p className="text-sm text-muted-foreground">
            Data shared with consent &middot; last updated{' '}
            {new Date(consent.updatedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto shrink-0">
          Consent granted
        </Badge>
      </div>

      {/* Income overview is always shown when canView */}
      <IncomeOverview snapshot={snapshot} />

      {/* Budgets section — requires shareBudgets consent */}
      {consent.shareBudgets ? (
        <BudgetBreakdown snapshot={snapshot} />
      ) : (
        <Alert>
          <Lock className="size-4" />
          <AlertTitle>Budget data not shared</AlertTitle>
          <AlertDescription>
            {clientName} has not enabled budget sharing. Ask them to update their
            privacy settings to see category budget breakdowns.
          </AlertDescription>
        </Alert>
      )}

      {/* Transactions section — requires shareTransactions or shareSpending consent */}
      {consent.shareTransactions || consent.shareSpending ? (
        <RecentTransactions snapshot={snapshot} />
      ) : (
        <Alert>
          <Lock className="size-4" />
          <AlertTitle>Transaction data not shared</AlertTitle>
          <AlertDescription>
            {clientName} has not enabled spending or transaction sharing. Ask them
            to update their privacy settings to see recent transactions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
