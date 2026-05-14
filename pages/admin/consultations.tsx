'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, FileText, Search, Download } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUserRole } from '@/hooks/use-user-role'
import { useConsultationRecords } from '@/hooks/use-store'
import { getActiveAdvisors } from '@/lib/data/mock-advisors'
import { mockClients } from '@/lib/data/mock-clients'
import { exportData } from '@/lib/utils/export'
import { formatDate } from '@/lib/utils/format'
import { getVisibleClients } from '@/lib/utils/role-filters'
import { RouteGuard } from '@/components/auth/route-guard'
import type { ConsultationRecord } from '@/lib/types/store'

/**
 * Adviser consultation records (SRD-A01: create, A04: update, A05: delete with
 * confirmation). Managers can also view across all advisers.
 */
function ConsultationsPageInner() {
  const { user } = useUserRole()
  const advisorId = user.role === 'fa' ? user.advisorId : undefined
  const { records, create, update, remove } = useConsultationRecords(
    user.role === 'manager' ? undefined : advisorId,
  )

  const visibleClients = useMemo(() => getVisibleClients(user), [user])
  const advisors = getActiveAdvisors()

  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ConsultationRecord | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  // form state
  const [topic, setTopic] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [clientId, setClientId] = useState(visibleClients[0]?.id ?? '')
  const [summary, setSummary] = useState('')

  useEffect(() => {
    if (!dialogOpen) return
    if (editing) {
      setTopic(editing.topic)
      setDate(editing.date.slice(0, 10))
      setClientId(editing.clientId)
      setSummary(editing.summary)
    } else {
      setTopic('')
      setDate(new Date().toISOString().slice(0, 10))
      setClientId(visibleClients[0]?.id ?? '')
      setSummary('')
    }
  }, [dialogOpen, editing, visibleClients])

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return records.filter(record => {
      const matchesSearch =
        !term ||
        record.topic.toLowerCase().includes(term) ||
        record.clientName.toLowerCase().includes(term) ||
        record.summary.toLowerCase().includes(term)
      const matchesClient = clientFilter === 'all' || record.clientId === clientFilter
      return matchesSearch && matchesClient
    })
  }, [records, search, clientFilter])

  function handleNew() {
    setEditing(null)
    setDialogOpen(true)
  }

  function handleEdit(record: ConsultationRecord) {
    setEditing(record)
    setDialogOpen(true)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!topic.trim() || !summary.trim() || !clientId) return
    const client = mockClients.find(c => c.id === clientId)
    const adv = advisors.find(a => a.id === (advisorId ?? editing?.advisorId)) ?? advisors[0]
    const payload = {
      topic: topic.trim(),
      date: new Date(date).toISOString(),
      clientId,
      clientName: client?.name ?? clientId,
      advisorId: editing?.advisorId ?? advisorId ?? adv?.id ?? 'ADV001',
      advisorName: editing?.advisorName ?? user.name,
      summary: summary.trim(),
    }
    if (editing) {
      update(editing.id, payload)
    } else {
      create(payload)
    }
    setDialogOpen(false)
  }

  function handleExport() {
    exportData({
      filename: `consultations-${new Date().toISOString().slice(0, 10)}`,
      rows: filtered,
      columns: [
        { key: 'date', label: 'Date', value: row => formatDate(row.date) },
        { key: 'topic', label: 'Topic' },
        { key: 'clientName', label: 'Client' },
        { key: 'advisorName', label: 'Adviser' },
        { key: 'summary', label: 'Summary' },
      ],
    })
  }

  return (
    <>
      <AdminHeader title="Consultations" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Consultation Records</h1>
              <p className="text-muted-foreground">
                {user.role === 'manager'
                  ? 'Review consultation records across all advisers.'
                  : 'Log topic, date, client, and summary for each client conversation.'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
                <Download className="mr-2 size-4" />
                Export
              </Button>
              {user.role === 'fa' && (
                <Button onClick={handleNew}>
                  <Plus className="mr-2 size-4" />
                  New Consultation
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filters</CardTitle>
              <CardDescription>Filter by client or search topic and summary text.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Search topic, client, or summary"
                    className="pl-9"
                  />
                </div>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All clients</SelectItem>
                    {visibleClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  {records.length === 0
                    ? 'No consultations recorded yet.'
                    : 'No consultations match the current filters.'}
                </CardContent>
              </Card>
            ) : (
              filtered.map(record => (
                <Card key={record.id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="size-4 text-primary" />
                          {record.topic}
                        </CardTitle>
                        <CardDescription>
                          {formatDate(record.date)} · {record.clientName}
                          {user.role === 'manager' && <> · {record.advisorName}</>}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-[10px]">
                          ID {record.id.slice(-6).toUpperCase()}
                        </Badge>
                        {(user.role === 'fa' && record.advisorId === advisorId) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(record)}
                              aria-label="Edit consultation"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setConfirmId(record.id)}
                              aria-label="Delete consultation"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm whitespace-pre-wrap">
                    {record.summary}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit consultation record' : 'New consultation record'}</DialogTitle>
            <DialogDescription>
              Capture the topic, date, client, and a summary of what was discussed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cons-topic">Topic</Label>
              <Input
                id="cons-topic"
                value={topic}
                onChange={event => setTopic(event.target.value)}
                placeholder="e.g. Quarterly review"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cons-date">Date</Label>
                <Input
                  id="cons-date"
                  type="date"
                  value={date}
                  onChange={event => setDate(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cons-summary">Summary</Label>
              <Textarea
                id="cons-summary"
                value={summary}
                onChange={event => setSummary(event.target.value)}
                rows={5}
                placeholder="Key topics discussed, decisions made, follow-ups…"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? 'Save changes' : 'Create record'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={confirmId !== null}
        onOpenChange={open => !open && setConfirmId(null)}
        title="Delete this consultation record?"
        description="The record will be permanently removed."
        onConfirm={() => {
          if (confirmId) remove(confirmId)
          setConfirmId(null)
        }}
      />
    </>
  )
}

export default function ConsultationsPage() {
  return (
    <RouteGuard allowedRoles={['manager', 'fa']}>
      <ConsultationsPageInner />
    </RouteGuard>
  )
}
