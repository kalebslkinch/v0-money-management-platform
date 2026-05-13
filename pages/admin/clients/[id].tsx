import type { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  MoreHorizontal,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockClients, getClientById } from '@/lib/data/mock-clients'
import { getTransactionsByClientId } from '@/lib/data/mock-transactions'
import { getPortfolioByClientId } from '@/lib/data/mock-portfolios'
import { useUserRole } from '@/hooks/use-user-role'
import { canAccessClient } from '@/lib/utils/role-filters'
import { formatCurrency, formatDate, formatPercentage, getInitials, formatDateTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import type { Client, Transaction, Portfolio } from '@/lib/types/admin'

const statusStyles = {
  active: 'bg-success/10 text-success border-success/20',
  inactive: 'bg-muted text-muted-foreground border-muted',
  pending: 'bg-warning/10 text-warning border-warning/20',
}

const riskStyles = {
  low: 'bg-success/10 text-success border-success/20',
  moderate: 'bg-warning/10 text-warning border-warning/20',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
}

const assetTypeColors = {
  stock: 'bg-chart-1/10 text-chart-1',
  bond: 'bg-chart-2/10 text-chart-2',
  etf: 'bg-chart-3/10 text-chart-3',
  cash: 'bg-muted text-muted-foreground',
  crypto: 'bg-chart-4/10 text-chart-4',
  'real-estate': 'bg-chart-5/10 text-chart-5',
}

const transactionStatusColors = {
  completed: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
}

interface ClientDetailPageProps {
  client: Client
  transactions: Transaction[]
  portfolio: Portfolio | null
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = mockClients.map(client => ({
    params: { id: client.id },
  }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<ClientDetailPageProps> = async ({ params }) => {
  const id = params?.id as string
  const client = getClientById(id)

  if (!client) {
    return { notFound: true }
  }

  const transactions = getTransactionsByClientId(id)
  const portfolio = getPortfolioByClientId(id) ?? null

  return {
    props: { client, transactions, portfolio },
  }
}

import { PFMSCustomerDashboard } from '@/components/admin/pfms-customer-dashboard'
import { PFMSCustomerBudgets } from '@/components/admin/pfms-customer-budgets'
import { PFMSCustomerSpending } from '@/components/admin/pfms-customer-spending'
import { getPFMSSnapshotForCustomer } from '@/lib/data/mock-pfms'

export default function ClientDetailPage({ client, transactions, portfolio }: ClientDetailPageProps) {
  const router = useRouter()
  const { user, isHydrated } = useUserRole()
  const hasAccess = canAccessClient(user, client)

  useEffect(() => {
    if (!isHydrated || hasAccess) return
    router.replace('/admin')
  }, [hasAccess, isHydrated, router])

  if (!isHydrated || !hasAccess) {
    return null
  }

  const backLink = user.role === 'customer' ? '/admin' : '/admin/clients'

  if (user.role === 'customer') {
    const snapshot = getPFMSSnapshotForCustomer(user.clientId ?? 'CLT001')
    return (
      <>
        <AdminHeader title="Your Finances" />
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-3xl space-y-8">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link href={backLink}>
                <ArrowLeft className="mr-2 size-4" />
                Back to Dashboard
              </Link>
            </Button>
            <PFMSCustomerDashboard snapshot={snapshot} />
            <PFMSCustomerBudgets snapshot={snapshot} />
            <PFMSCustomerSpending snapshot={snapshot} />
          </div>
        </main>
      </>
    )
  }

  // ...existing code for manager/fa...
  return (
    <>
      <AdminHeader title={client.name} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Back Button */}
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href={backLink}>
              <ArrowLeft className="mr-2 size-4" />
              Back to Clients
            </Link>
          </Button>
          {/* ...existing code for manager/fa... */}
        </div>
      </main>
    </>
  )
}
