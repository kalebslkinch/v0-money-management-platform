'use client'

import { ShieldCheck, FileText, Database } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useUserRole } from '@/hooks/use-user-role'
import { useDataSharingConsent } from '@/hooks/use-store'
import { mockAdvisors } from '@/lib/data/mock-advisors'
import { mockClients } from '@/lib/data/mock-clients'
import { formatDateTime } from '@/lib/utils/format'

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
              <p className="text-xs text-muted-foreground">
                We do not sell your personal data. Aggregated, anonymised insights may be used to
                improve the service.
              </p>
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
                <Badge variant="outline" className="text-xs">
                  Read-only — switch to a customer role to edit consent.
                </Badge>
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
