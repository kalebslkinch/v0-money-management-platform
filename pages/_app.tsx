import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import '../styles/globals.css'

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function App({ Component, pageProps, router }: AppProps) {
  const isAdminPage = router.pathname.startsWith('/admin')
  const content = <Component {...pageProps} />

  return (
    <>
      {isAdminPage ? <AdminLayout>{content}</AdminLayout> : content}
      {process.env.NODE_ENV === 'production' && <Analytics />}
    </>
  )
}
