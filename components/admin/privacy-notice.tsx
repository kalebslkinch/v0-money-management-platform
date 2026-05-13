'use client'

import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrivacyNoticeProps {
  /**
   * Custom message displayed before the standard "review settings" link.
   * Defaults to the generic platform notice used across pages.
   */
  message?: string
  className?: string
  /**
   * If false, the privacy/consent management link is hidden — useful where
   * the linked page is unavailable (for example on the privacy page itself).
   */
  showSettingsLink?: boolean
}

/**
 * Compact, consistent data privacy / consent / data usage notice used on
 * key pages to satisfy SRD-G04. Links to the privacy & sharing page where
 * customers manage consent (SRD-U08).
 */
export function PrivacyNotice({
  message = 'We only use your financial data to power the budgeting and reporting features you see. Your data is never sold and is shared with advisers only with your consent.',
  className,
  showSettingsLink = true,
}: PrivacyNoticeProps) {
  return (
    <div
      role="note"
      aria-label="Data privacy notice"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground/80',
        className,
      )}
    >
      <ShieldCheck className="size-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        <p>{message}</p>
        {showSettingsLink && (
          <p>
            <Link href="/admin/privacy" className="text-primary hover:underline font-medium">
              Review privacy & sharing settings
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
