'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HelpCircle, BookOpen, MessagesSquare, ShieldCheck, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

/**
 * Help & Support drawer wired into the global header to satisfy SRD-G02
 * (visible help and support access on all pages).
 */
export function HelpDrawer() {
  const [open, setOpen] = useState(false)

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
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-6 p-6">
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
