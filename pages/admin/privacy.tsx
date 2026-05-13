'use client'

import { ShieldCheck, FileText, Database, TrendingUp } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useUserRole } from '@/hooks/use-user-role'
import { useDataSharingConsent } from '@/hooks/use-store'
import { mockAdvisors } from '@/lib/data/mock-advisors'
import { mockClients } from '@/lib/data/mock-clients'
import { kpiData, riskDistributionData } from '@/lib/data/mock-analytics'
import { formatDateTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

/**
 * Privacy, consent and data-usage management page (SRD-G04, SRD-U08).
 * Visible to all roles, but only customers can edit consent for their own
 * data. Other roles see read-only context for the page.
 */
export default function PrivacyPage() {
  const { user } = useUserRole()
  const isCustomer = user.role === 'customer'
  const clientId = isCustomer ? user.clientId ?? mockClients[0]?.id : undefined
  const { consent, update } = useDataSharingConsent(clientId)

  const advisorName =
    mockClients.find(client => client.id === clientId)?.advisor ??
    mockAdvisors[0]?.name ??
    'your assigned adviser'

  return (
    <>
      <AdminHeader title="Privacy & Sharing" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Privacy & Sharing</h1>
            <p className="text-muted-foreground">
              See what data we hold and decide what to share with your adviser.
            </p>
          </div>

          {/* What data we hold (G04) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-4 text-primary" />
                What we collect and how we use it
              </CardTitle>
              <CardDescription>
                We only use your financial data to power the budgeting and reporting features in
                this app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                <li>
                  <span className="text-foreground">Transactions</span> — to show recent activity
                  and category trends.
                </li>
                <li>
                  <span className="text-foreground">Budgets</span> — to compare your spending
                  against weekly plans.
                </li>
                <li>
                  <span className="text-foreground">Spending summaries</span> — to generate
                  personalised reports.
                </li>
                <li>
                  <span className="text-foreground">Profile info</span> — name, email, and
                  assigned adviser to coordinate consultations.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Consent / sharing controls (U08) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Share with {advisorName}
              </CardTitle>
              <CardDescription>
                Granular controls. Your adviser will only see the categories you switch on. Last
                updated{' '}
                <span className="font-medium text-foreground">
                  {consent.updatedAt && new Date(consent.updatedAt).getTime() > 0
                    ? formatDateTime(consent.updatedAt)
                    : 'never'}
                </span>
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCustomer && (
                <p className="text-xs text-muted-foreground">
                  These consent settings are managed by the account holder and cannot be modified
                  here.
                </p>
              )}

              <ConsentRow
                label="Allow my adviser to view authorised summaries"
                description="Master switch. When off, no data is shared regardless of the toggles below."
                checked={consent.shareWithAdvisor}
                onChange={value => update({ shareWithAdvisor: value })}
                disabled={!isCustomer}
              />

              <Separator />

              <ConsentRow
                label="Spending summaries"
                description="High-level totals by category for the current week."
                checked={consent.shareSpending}
                onChange={value => update({ shareSpending: value })}
                disabled={!isCustomer || !consent.shareWithAdvisor}
              />

              <ConsentRow
                label="Budget plans"
                description="Weekly category budgets and projected spend."
                checked={consent.shareBudgets}
                onChange={value => update({ shareBudgets: value })}
                disabled={!isCustomer || !consent.shareWithAdvisor}
              />

              <ConsentRow
                label="Individual transactions"
                description="Specific merchant and amount details."
                checked={consent.shareTransactions}
                onChange={value => update({ shareTransactions: value })}
                disabled={!isCustomer || !consent.shareWithAdvisor}
              />
            </CardContent>
          </Card>

          {/* Anonymised platform trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                Anonymised platform trends
              </CardTitle>
              <CardDescription>
                What we learn across all platform users — aggregated, stripped of any personally
                identifiable information, and used only to improve the service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* KPI stat tiles */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <TrendTile
                  label="Active clients"
                  value={String(kpiData.activeClients)}
                  sub={`+${kpiData.clientsChange}% growth`}
                  positive
                />
                <TrendTile
                  label="Assets under management"
                  value={`£${(kpiData.totalAUM / 1_000_000).toFixed(1)}M`}
                  sub={`+${kpiData.aumChange}% YTD`}
                  positive
                />
                <TrendTile
                  label="Avg. budget adherence"
                  value="82%"
                  sub="+4 pp vs last month"
                  positive
                />
                <TrendTile
                  label="Most common overspend"
                  value="Food delivery"
                  sub="Flagged across 4 clients"
                />
              </div>

              {/* Risk profile stacked bar */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Client risk profile distribution
                </p>
                <div className="flex h-3 w-full overflow-hidden rounded-full">
                  {riskDistributionData.map((r, i) => (
                    <div
                      key={r.level}
                      className={cn(
                        'h-full transition-all',
                        i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-amber-400' : 'bg-red-500',
                      )}
                      style={{ width: `${r.percentage}%` }}
                      title={`${r.level}: ${r.percentage}%`}
                    />
                  ))}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {riskDistributionData.map((r, i) => (
                    <span key={r.level} className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'inline-block size-2 rounded-full',
                          i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-amber-400' : 'bg-red-500',
                        )}
                      />
                      {r.level} — {r.percentage}%
                    </span>
                  ))}
                </div>
              </div>

              {/* PFMS category adherence bars */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Budget adherence by spending category — platform avg.
                </p>
                {CATEGORY_TRENDS.map(cat => (
                  <CategoryAdherenceRow key={cat.label} {...cat} />
                ))}
              </div>

              <p className="border-t pt-3 text-xs text-muted-foreground">
                Trends are computed across{' '}
                <span className="font-medium text-foreground">
                  {kpiData.activeClients} active customers
                </span>{' '}
                and refreshed weekly. Names, account numbers, and individual transaction details are
                never included in any aggregated output.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Your rights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>You can withdraw consent at any time by toggling the switches above.</p>
              <p>
                To request a copy of your data or its deletion, contact{' '}
                <a className="text-primary hover:underline" href="mailto:privacy@alphafinance.com">
                  privacy@alphafinance.com
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

interface ConsentRowProps {
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange: (value: boolean) => void
}

function ConsentRow({ label, description, checked, disabled, onChange }: ConsentRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  )
}

// ─── Anonymised trends helpers ─────────────────────────────────────────────────

const CATEGORY_TRENDS = [
  { label: 'Groceries',     pct: 81, note: 'Tracking well — minor impulse purchases detected' },
  { label: 'Food delivery', pct: 67, note: 'Most common overspend — flagged platform-wide' },
  { label: 'Transport',     pct: 88, note: 'Consistent across most clients' },
  { label: 'Subscriptions', pct: 94, note: 'Highest adherence category' },
  { label: 'Household',     pct: 79, note: 'Slight increase tracked this month' },
]

interface TrendTileProps {
  label: string
  value: string
  sub: string
  positive?: boolean
}

function TrendTile({ label, value, sub, positive }: TrendTileProps) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold leading-tight truncate">{value}</p>
      <p className={cn('text-xs', positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
        {sub}
      </p>
    </div>
  )
}

interface CategoryAdherenceRowProps {
  label: string
  pct: number
  note: string
}

function CategoryAdherenceRow({ label, pct, note }: CategoryAdherenceRowProps) {
  const barColor = pct >= 85 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-400' : 'bg-red-500'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{pct}% within budget</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  )
}
