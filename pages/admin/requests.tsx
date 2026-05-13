'use client'

import { useMemo, useState } from 'react'
import { Plus, Send, Trash2, MessagesSquare, ChevronRight } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { PrivacyNotice } from '@/components/admin/privacy-notice'
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
import { pushNotification, useConsultationRequests } from '@/hooks/use-store'
import { mockClients, getClientById } from '@/lib/data/mock-clients'
import { getActiveAdvisors } from '@/lib/data/mock-advisors'
import type { ConsultationRequest, ConsultationRequestStatus } from '@/lib/types/store'
import { formatRelativeTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<ConsultationRequestStatus, string> = {
  open: 'Open',
  assigned: 'Assigned',
  responded: 'Responded',
  closed: 'Closed',
}

const STATUS_STYLE: Record<ConsultationRequestStatus, string> = {
  open: 'bg-warning/10 text-warning border-warning/20',
  assigned: 'bg-primary/10 text-primary border-primary/20',
  responded: 'bg-success/10 text-success border-success/20',
  closed: 'bg-muted text-muted-foreground border-muted',
}

/**
 * Customer requests + advisor inbox for SRD-U07 and SRD-A06. Managers can
 * see and reassign all requests (supports SRD-M03 / SRD-M07 cross-cutting).
 */
export default function RequestsPage() {
  const { user } = useUserRole()
  const { requests, create, update, respond, remove } = useConsultationRequests()

  const visibleRequests = useMemo(() => {
    if (user.role === 'manager') return requests
    if (user.role === 'fa') {
      return requests.filter(req => req.assignedAdvisorId === user.advisorId || !req.assignedAdvisorId)
    }
    return requests.filter(req => req.clientId === user.clientId)
  }, [requests, user])

  const [newOpen, setNewOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  // Customer new request form
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')
  const [preferredDate, setPreferredDate] = useState('')

  function resetForm() {
    setTopic('')
    setMessage('')
    setPreferredDate('')
  }

  function handleSubmitNew() {
    if (!topic.trim() || !message.trim()) return
    const clientId = user.clientId
    if (!clientId) return
    const client = getClientById(clientId)
    create({
      clientId,
      clientName: client?.name ?? 'Customer',
      topic: topic.trim(),
      message: message.trim(),
      preferredDate: preferredDate || undefined,
      assignedAdvisorId: client?.advisorId,
      assignedAdvisorName: client?.advisor,
    })
    resetForm()
    setNewOpen(false)
  }

  return (
    <>
      <AdminHeader
        title={user.role === 'customer' ? 'My Requests' : 'Consultation Requests'}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {user.role === 'customer' ? 'Adviser Consultation Requests' : 'Client Requests Inbox'}
              </h1>
              <p className="text-muted-foreground">
                {user.role === 'customer'
                  ? 'Submit a new question or check progress on existing requests.'
                  : user.role === 'fa'
                    ? 'Respond to requests from clients assigned to you.'
                    : 'Triage and assign incoming client requests.'}
              </p>
            </div>
            {user.role === 'customer' && (
              <Button onClick={() => setNewOpen(true)}>
                <Plus className="mr-2 size-4" />
                New Request
              </Button>
            )}
          </div>

          {user.role === 'customer' && <PrivacyNotice />}

          <div className="space-y-3">
            {visibleRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  {user.role === 'customer'
                    ? 'No requests yet. Use “New Request” to ask your adviser something.'
                    : 'No requests in your queue.'}
                </CardContent>
              </Card>
            ) : (
              visibleRequests.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  role={user.role}
                  currentUserName={user.name}
                  currentAdvisorId={user.role === 'fa' ? user.advisorId : undefined}
                  onUpdate={update}
                  onRespond={respond}
                  onDelete={() => setConfirmId(request.id)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Customer create dialog (SRD-U07) */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New consultation request</DialogTitle>
            <DialogDescription>
              Tell your adviser what you need help with. They&apos;ll be notified immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="req-topic">Topic</Label>
              <Input
                id="req-topic"
                value={topic}
                onChange={event => setTopic(event.target.value)}
                placeholder="e.g. Reviewing my weekly budget"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="req-message">Message</Label>
              <Textarea
                id="req-message"
                value={message}
                onChange={event => setMessage(event.target.value)}
                rows={4}
                placeholder="Add any context that will help your adviser respond"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="req-date">Preferred date (optional)</Label>
              <Input
                id="req-date"
                type="date"
                value={preferredDate}
                onChange={event => setPreferredDate(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitNew} disabled={!topic.trim() || !message.trim()}>
              <Send className="mr-2 size-4" />
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={confirmId !== null}
        onOpenChange={open => !open && setConfirmId(null)}
        title="Delete this request?"
        description="The conversation history will be removed for everyone."
        onConfirm={() => {
          if (confirmId) remove(confirmId)
          setConfirmId(null)
        }}
      />
    </>
  )
}

interface RequestCardProps {
  request: ConsultationRequest
  role: 'manager' | 'fa' | 'customer'
  currentUserName: string
  currentAdvisorId?: string
  onUpdate: (id: string, patch: Partial<ConsultationRequest>) => void
  onRespond: (
    id: string,
    payload: { authorId: string; authorName: string; authorRole: 'manager' | 'fa' | 'customer'; message: string },
  ) => void
  onDelete: () => void
}

function RequestCard({
  request,
  role,
  currentUserName,
  currentAdvisorId,
  onUpdate,
  onRespond,
  onDelete,
}: RequestCardProps) {
  const [reply, setReply] = useState('')
  const [expanded, setExpanded] = useState(false)
  const advisors = getActiveAdvisors()

  function handleAssign(advisorId: string) {
    const advisor = advisors.find(a => a.id === advisorId)
    if (!advisor) return
    onUpdate(request.id, {
      assignedAdvisorId: advisor.id,
      assignedAdvisorName: advisor.name,
      status: 'assigned',
    })
    pushNotification({
      kind: 'request',
      audience: 'fa',
      audienceUserId: advisor.id,
      title: 'Request assigned',
      message: `You were assigned a request from ${request.clientName}: “${request.topic}”.`,
      href: '/admin/requests',
    })
  }

  function handleStatus(status: ConsultationRequestStatus) {
    onUpdate(request.id, { status })
  }

  function handleReply() {
    if (!reply.trim()) return
    onRespond(request.id, {
      authorId: role === 'fa' ? currentAdvisorId ?? 'unknown' : role,
      authorName: currentUserName,
      authorRole: role,
      message: reply.trim(),
    })
    setReply('')
    setExpanded(true)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{request.topic}</CardTitle>
              <Badge variant="outline" className={cn('text-[11px]', STATUS_STYLE[request.status])}>
                {STATUS_LABEL[request.status]}
              </Badge>
            </div>
            <CardDescription>
              From <span className="font-medium text-foreground">{request.clientName}</span>
              {request.assignedAdvisorName && (
                <> · Assigned to {request.assignedAdvisorName}</>
              )}
              {' '}· {formatRelativeTime(request.createdAt)}
            </CardDescription>
          </div>
          {role === 'manager' && (
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive">
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="rounded-lg bg-muted/40 p-3">{request.message}</p>

        {role === 'manager' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Assign:</span>
            <Select
              value={request.assignedAdvisorId ?? ''}
              onValueChange={handleAssign}
            >
              <SelectTrigger className="w-[200px] h-8 text-xs">
                <SelectValue placeholder="Choose adviser" />
              </SelectTrigger>
              <SelectContent>
                {advisors.map(advisor => (
                  <SelectItem key={advisor.id} value={advisor.id}>
                    {advisor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={request.status}
              onValueChange={value => handleStatus(value as ConsultationRequestStatus)}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['open', 'assigned', 'responded', 'closed'] as ConsultationRequestStatus[]).map(status => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABEL[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {(request.responses.length > 0 || expanded) && (
          <button
            onClick={() => setExpanded(value => !value)}
            className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          >
            <ChevronRight
              className={cn('size-3 transition-transform', expanded && 'rotate-90')}
            />
            <MessagesSquare className="size-3" />
            {request.responses.length} {request.responses.length === 1 ? 'response' : 'responses'}
          </button>
        )}

        {expanded && request.responses.length > 0 && (
          <div className="space-y-2 border-l-2 border-primary/30 pl-3">
            {request.responses.map(response => (
              <div key={response.id} className="text-xs space-y-1">
                <p className="font-medium">
                  {response.authorName}{' '}
                  <span className="text-muted-foreground font-normal">
                    ({response.authorRole}) · {formatRelativeTime(response.createdAt)}
                  </span>
                </p>
                <p className="text-muted-foreground whitespace-pre-wrap">{response.message}</p>
              </div>
            ))}
          </div>
        )}

        {request.status !== 'closed' && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Textarea
              value={reply}
              onChange={event => setReply(event.target.value)}
              placeholder={
                role === 'customer'
                  ? 'Add more context for your adviser…'
                  : 'Respond to the client…'
              }
              rows={2}
              className="flex-1"
            />
            <Button size="sm" onClick={handleReply} disabled={!reply.trim()}>
              <Send className="mr-2 size-4" />
              Send
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Eagerly reference mockClients to avoid tree-shaking when the module is
// imported only for its types in some environments.
void mockClients
