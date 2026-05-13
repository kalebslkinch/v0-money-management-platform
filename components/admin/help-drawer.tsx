'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HelpCircle, BookOpen, MessagesSquare, ShieldCheck, ExternalLink, Flag, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useUserRole } from '@/hooks/use-user-role'
import { useComplaints } from '@/hooks/use-store'
import type { ComplaintCategory } from '@/lib/types/store'

/**
 * Help & Support drawer wired into the global header to satisfy SRD-G02
 * (visible help and support access on all pages).
 */
export function HelpDrawer() {
  const [open, setOpen] = useState(false)
  const { user, role, isHydrated } = useUserRole()
  const isCustomer = isHydrated && role === 'customer'

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Help and support"
          className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <HelpCircle className="size-[18px]" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-6 p-6 overflow-y-auto">
        <SheetHeader className="p-0">
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="size-4 text-primary" />
            Help & Support
          </SheetTitle>
          <SheetDescription>
            Find guides, contact support, and review platform policies.
          </SheetDescription>
        </SheetHeader>
        <SheetHeader className="p-0">
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="size-4 text-primary" />
            Help & Support
          </SheetTitle>
          <SheetDescription>
            Find guides, contact support, and review platform policies.
          </SheetDescription>
        </SheetHeader>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold tracking-tight">Quick guides</h3>
          <div className="grid gap-2">
            <HelpItem
              icon={BookOpen}
              title="Recording transactions"
              description="Add, categorise, edit, or delete a transaction."
            />
            <HelpItem
              icon={BookOpen}
              title="Customising your dashboard"
              description="Pin widgets, save views, and reset to defaults."
            />
            <HelpItem
              icon={BookOpen}
              title="Sharing data with your adviser"
              description="Manage consent for spending, budgets, and transactions."
            />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold tracking-tight">Contact us</h3>
          <div className="rounded-xl border p-3 text-sm space-y-2">
            <p className="flex items-center gap-2">
              <MessagesSquare className="size-4 text-primary" />
              <span>Live chat: weekdays 09:00 – 18:00</span>
            </p>
            <p className="text-muted-foreground">
              Email{' '}
              <a className="text-primary hover:underline" href="mailto:support@pmfs.example.com">
                support@pmfs.example.com
              </a>{' '}
              for non-urgent help.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold tracking-tight">Policies</h3>
          <div className="grid gap-2">
            <Link
              href="/admin/privacy"
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 rounded-xl border p-3 hover:bg-accent transition-colors"
            >
              <ShieldCheck className="size-4 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Privacy & data sharing</p>
                <p className="text-xs text-muted-foreground">
                  See what data we hold and update sharing consent.
                </p>
              </div>
              <ExternalLink className="size-3.5 text-muted-foreground ml-auto mt-1" />
            </Link>
          </div>
        </section>

        {isCustomer && (
          <ComplaintForm
            clientId={user.clientId ?? user.id}
            clientName={user.name}
            onSubmitted={() => setOpen(false)}
          />
        )}

        <SheetClose asChild>
          <Button variant="outline" className="mt-auto">
            Close
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  )
}

interface HelpItemProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

function HelpItem({ icon: Icon, title, description }: HelpItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border p-3">
      <Icon className="size-4 text-primary mt-0.5 shrink-0" />
      <div className="text-sm">
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

// ─── Complaint form ────────────────────────────────────────────────────────────

const COMPLAINT_CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: 'service', label: 'Service quality' },
  { value: 'billing', label: 'Billing or charges' },
  { value: 'technical', label: 'Technical issue' },
  { value: 'advisor', label: 'Advisor conduct' },
  { value: 'other', label: 'Other' },
]

interface ComplaintFormProps {
  clientId: string
  clientName: string
  onSubmitted: () => void
}

function ComplaintForm({ clientId, clientName, onSubmitted }: ComplaintFormProps) {
  const { create } = useComplaints(clientId)
  const [submitted, setSubmitted] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [category, setCategory] = useState<ComplaintCategory | ''>('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category) {
      setError('Please select a category.')
      return
    }
    if (!subject.trim()) {
      setError('Please enter a subject.')
      return
    }
    if (!description.trim()) {
      setError('Please describe your complaint.')
      return
    }
    setError('')
    const complaint = create({
      clientId,
      clientName,
      category: category as ComplaintCategory,
      subject: subject.trim(),
      description: description.trim(),
    })
    setReferenceNumber(complaint.referenceNumber)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
          <Flag className="size-4 text-destructive" />
          Submit a Complaint
        </h3>
        <div className="rounded-xl border border-chart-2/30 bg-chart-2/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-chart-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <p className="text-sm font-medium">Complaint submitted</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Your complaint has been received. Reference:{' '}
            <span className="font-mono font-semibold text-foreground">{referenceNumber}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            We aim to respond within 5 business days. You can quote this reference in any follow-up.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-1"
            onClick={() => {
              setSubmitted(false)
              setCategory('')
              setSubject('')
              setDescription('')
            }}
          >
            Submit another
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
        <Flag className="size-4 text-destructive" />
        Submit a Complaint
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="complaint-category" className="text-xs">Category</Label>
          <Select value={category} onValueChange={v => setCategory(v as ComplaintCategory)}>
            <SelectTrigger id="complaint-category" className="rounded-lg text-sm h-9">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {COMPLAINT_CATEGORIES.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="complaint-subject" className="text-xs">Subject</Label>
          <Input
            id="complaint-subject"
            placeholder="Brief summary of the issue"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="rounded-lg text-sm h-9"
            maxLength={120}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="complaint-description" className="text-xs">Description</Label>
          <Textarea
            id="complaint-description"
            placeholder="Please describe your complaint in detail…"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="rounded-lg text-sm resize-none"
            rows={4}
            maxLength={1000}
          />
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        <Button type="submit" size="sm" className="w-full">
          Submit complaint
        </Button>
      </form>
    </section>
  )
}
