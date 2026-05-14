'use client'

/**
 * First-visit onboarding tour (SRD-G11).
 *
 * Shows a role-specific multi-step modal the first time a user lands on the
 * admin shell. Completion / dismissal is persisted via useOnboarding so it
 * never re-appears for the same user. Users can re-launch the tour from
 * Settings > Onboarding (also exposed by reset()).
 */

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Compass,
  Gauge,
  PiggyBank,
  Receipt,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useOnboarding } from '@/hooks/use-store'
import { useUserRole } from '@/hooks/use-user-role'
import type { UserRole } from '@/lib/auth/user-context'

interface TourStep {
  title: string
  body: string
  icon: React.ComponentType<{ className?: string }>
}

const STEPS: Record<UserRole, TourStep[]> = {
  customer: [
    {
      title: 'Welcome to Alpha Finance',
      body: 'Your secure, private money-management dashboard. We will walk through the basics in three quick steps.',
      icon: Compass,
    },
    {
      title: 'Record your spending',
      body: 'Use “Record Transaction” to log purchases manually, or tap “Scan with AI” to extract a receipt automatically.',
      icon: Receipt,
    },
    {
      title: 'Set budgets and goals',
      body: 'Visit Budgets to set weekly limits. We will alert you when a category nears or exceeds its limit.',
      icon: PiggyBank,
    },
    {
      title: 'Stay in control of your data',
      body: 'You decide what your adviser sees. Use Privacy & Sharing to grant or revoke consent at any time.',
      icon: ShieldCheck,
    },
  ],
  fa: [
    {
      title: 'Welcome, Adviser',
      body: 'A quick orientation to your daily workflow on Alpha Finance.',
      icon: Compass,
    },
    {
      title: 'Manage your clients',
      body: 'The Clients page lists everyone assigned to you. Open any client to see their authorised summary, internal notes, and consultations.',
      icon: Users,
    },
    {
      title: 'Log consultations from templates',
      body: 'Use the consultation templates to log calls in seconds – topic, summary outline, and follow-up tasks are pre-filled.',
      icon: ClipboardList,
    },
    {
      title: 'Stay sharp',
      body: 'The Learning Hub and Recent Consultations widget keep compliance updates and your last calls one click away.',
      icon: ShieldCheck,
    },
  ],
  manager: [
    {
      title: 'Welcome, Manager',
      body: 'A four-step tour of the management cockpit.',
      icon: Compass,
    },
    {
      title: 'Performance dashboard',
      body: 'See satisfaction, completion rate, and response time at a glance, plus auto-generated training and recognition recommendations.',
      icon: Gauge,
    },
    {
      title: 'Team & tasks',
      body: 'Assign work in Tasks. Duplicate and overdue items are flagged automatically so nothing slips through.',
      icon: Users,
    },
    {
      title: 'Insights and reports',
      body: 'Use Team Health for workload monitoring and the Reports library for standardised templates – including the auto-generated quarterly trend report.',
      icon: ClipboardList,
    },
  ],
}

export function OnboardingTour() {
  const { user, isHydrated } = useUserRole()
  const { state, complete, dismiss } = useOnboarding(user.userId, user.role)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  const steps = useMemo(() => STEPS[user.role] ?? STEPS.customer, [user.role])

  useEffect(() => {
    if (!isHydrated) return
    if (state.completed) return
    // Defer slightly so the shell finishes rendering first
    const timer = setTimeout(() => setOpen(true), 600)
    return () => clearTimeout(timer)
  }, [isHydrated, state.completed])

  function handleNext() {
    if (step >= steps.length - 1) {
      complete()
      setOpen(false)
      setStep(0)
      return
    }
    setStep(step + 1)
  }

  function handleSkip() {
    dismiss()
    setOpen(false)
    setStep(0)
  }

  if (!isHydrated) return null
  const current = steps[step]
  if (!current) return null
  const Icon = current.icon
  const isLast = step === steps.length - 1

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) handleSkip()
        else setOpen(true)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <Badge variant="outline" className="w-fit text-[10px] mb-2">
            Step {step + 1} of {steps.length}
          </Badge>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="size-5 text-primary" />
            {current.title}
          </DialogTitle>
          <DialogDescription className="pt-2">{current.body}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1.5 pt-2">
          {steps.map((_, index) => (
            <span
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Skip tour
          </Button>
          <Button size="sm" onClick={handleNext} className="gap-1.5">
            {isLast ? (
              <>
                <CheckCircle2 className="size-4" />
                Get started
              </>
            ) : (
              <>
                Next
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
