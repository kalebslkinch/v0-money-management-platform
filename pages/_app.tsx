import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import {
  createDefaultUser,
  PMFS_USER_STORAGE_KEY,
  parseStoredUser,
} from '@/lib/auth/user-context'
import '../styles/globals.css'
import { Lato } from 'next/font/google';

const lato = Lato({ subsets: ['latin'], weight: ['400', '700'] });

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={`${lato.className} geist.className`}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}

export default function App({ Component, pageProps, router }: AppProps) {
  const isAdminPage = router.pathname.startsWith('/admin')
  const content = <Component {...pageProps} />

  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = parseStoredUser(localStorage.getItem(PMFS_USER_STORAGE_KEY))
    if (stored) return

    localStorage.setItem(PMFS_USER_STORAGE_KEY, JSON.stringify(createDefaultUser()))
  }, [])

  return (
    <>
      {isAdminPage ? <AdminLayout>{content}</AdminLayout> : content}
      {process.env.NODE_ENV === 'production' && <Analytics />}
    </>
  )
}
