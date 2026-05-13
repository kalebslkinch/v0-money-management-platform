import type { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown,
  Pencil,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ClientTable } from '@/components/admin/client-table'
import { EditStaffDialog } from '@/components/admin/edit-staff-dialog'
import { mockAdvisors, getAdvisorById } from '@/lib/data/mock-advisors'
import { mockClients } from '@/lib/data/mock-clients'
import { formatCurrency, formatPercentage, formatDate, getInitials } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import type { Advisor, Client } from '@/lib/types/admin'

interface StaffProfilePageProps {
  advisor: Advisor
  clients: Client[]
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: mockAdvisors.map(a => ({ params: { id: a.id } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<StaffProfilePageProps> = async ({ params }) => {
  const advisor = getAdvisorById(params?.id as string)
  if (!advisor) return { notFound: true }
  const clients = mockClients.filter(c => advisor.clientIds.includes(c.id))
  return { props: { advisor, clients } }
}

const roleLabels: Record<Advisor['role'], string> = {
  senior_advisor: 'Senior Advisor',
  advisor: 'Advisor',
  junior_advisor: 'Junior Advisor',
}

const roleStyles: Record<Advisor['role'], string> = {
  senior_advisor: 'bg-primary/10 text-primary border-primary/20',
  advisor: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  junior_advisor: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
}

const statusStyles: Record<Advisor['status'], string> = {
  active: 'bg-success/10 text-success border-success/20',
  on_leave: 'bg-warning/10 text-warning border-warning/20',
  inactive: 'bg-muted text-muted-foreground border-muted',
}

const statusLabels: Record<Advisor['status'], string> = {
  active: 'Active',
  on_leave: 'On Leave',
  inactive: 'Inactive',
}

export default function StaffProfilePage({ advisor, clients }: StaffProfilePageProps) {
  const [localAdvisor, setLocalAdvisor] = useState(advisor)
  const [editOpen, setEditOpen] = useState(false)

  const periods = [
    { label: 'Monthly', value: localAdvisor.performance.monthly },
    { label: 'Quarterly', value: localAdvisor.performance.quarterly },
    { label: 'Yearly', value: localAdvisor.performance.yearly },
  ]

  return (
    <>
      <AdminHeader title={localAdvisor.name} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">

          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/admin/staff">
              <ArrowLeft className="mr-2 size-4" />
              Back to Staff
            </Link>
          </Button>

          {/* Header Card */}
          <Card className="rounded-2xl border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                <Avatar className="size-16 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {getInitials(localAdvisor.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold tracking-tight">{localAdvisor.name}</h2>
                    <Badge variant="outline" className={cn('text-xs', roleStyles[localAdvisor.role])}>
                      {roleLabels[localAdvisor.role]}
                    </Badge>
                    <Badge variant="outline" className={cn('text-xs', statusStyles[localAdvisor.status])}>
                      {statusLabels[localAdvisor.status]}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="size-4 shrink-0" />
                      <span className="truncate">{localAdvisor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="size-4 shrink-0" />
                      <span>{localAdvisor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-4 shrink-0" />
                      <span>Joined {formatDate(localAdvisor.joinDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{formatCurrency(localAdvisor.totalAUM, true)}</span>
                      <span>AUM</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-xl gap-2"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <CardDescription>Portfolio returns across all managed clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {periods.map(p => (
                  <div key={p.label} className="rounded-xl bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground mb-1">{p.label}</p>
                    <div className={cn('flex items-center gap-1.5 text-lg font-bold', p.value >= 0 ? 'text-success' : 'text-destructive')}>
                      {p.value >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                      {formatPercentage(p.value)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client Roster */}
          <Card className="rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle>Client Roster</CardTitle>
              <CardDescription>{clients.length} client{clients.length !== 1 ? 's' : ''} assigned</CardDescription>
            </CardHeader>
            <CardContent>
              {clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No clients currently assigned.</p>
              ) : (
                <ClientTable clients={clients} showAdvisor={false} allowActions />
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <EditStaffDialog
        advisor={localAdvisor}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={saved => setLocalAdvisor(saved)}
      />
    </>
  )
}
