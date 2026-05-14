import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { DashboardToolbar } from '@/components/admin/dashboard-toolbar'
import { DashboardGrid } from '@/components/admin/dashboard-grid'
import { DailyBriefing } from '@/components/admin/daily-briefing'
import { PFMSCustomerDashboard } from '@/components/admin/pfms-customer-dashboard'
import { PrivacyNotice } from '@/components/admin/privacy-notice'
import { useDashboardLayout } from '@/hooks/use-dashboard-layout'
import { useUserRole } from '@/hooks/use-user-role'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'
import {
  shouldShowBriefing,
  dismissBriefingForToday,
  resetBriefingDismissal,
} from '@/lib/dashboard/briefing-engine'

export default function AdminDashboard() {
  const layout = useDashboardLayout()
  const { user } = useUserRole()

  // Briefing mode: on by default for a new calendar day, off once dismissed
  const [briefingMode, setBriefingMode] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setBriefingMode(shouldShowBriefing())
    setHydrated(true)
  }, [])

  function handleExpandDashboard() {
    dismissBriefingForToday()
    setBriefingMode(false)
  }

  function handleReturnToBriefing() {
    resetBriefingDismissal()
    setBriefingMode(true)
  }

  if (user.role === 'customer') {
    const snapshot = getPFMSSnapshotForCustomer(user.clientId ?? 'CLT001')

    return (
      <>
        <AdminHeader title="My Budget" />
        <main className="flex-1 overflow-auto">
          <div className="px-6 md:px-8 pt-6 pb-8">
            <div className="mx-auto max-w-7xl space-y-6">
              <PrivacyNotice />
              <PFMSCustomerDashboard snapshot={snapshot} />
            </div>
          </div>
        </main>
      </>
    )
  }

  const firstName = user.name.split(' ')[0] ?? 'Manager'

  // Render briefing for staff roles (fa, manager) when briefing mode is active.
  // Guard with `hydrated` to avoid hydration mismatch (localStorage is client-only).
  if (hydrated && briefingMode) {
    return (
      <>
        <AdminHeader title="Daily Briefing" />
        <main className="flex-1 overflow-auto">
          <DailyBriefing
            userName={firstName}
            onExpand={handleExpandDashboard}
          />
        </main>
      </>
    )
  }

  return (
    <>
      <AdminHeader title="Dashboard" />
      <main className="flex-1 overflow-auto">
        <DashboardToolbar
          layout={layout}
          managerName={firstName}
          onReturnToBriefing={handleReturnToBriefing}
        />
        <div className="px-6 md:px-8 pt-6 pb-8">
          <div className="mx-auto max-w-7xl">
            <DashboardGrid layout={layout} />
          </div>
        </div>
      </main>
    </>
  )
}
