'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MessagesSquare, Plus, Send, Users } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { RouteGuard } from '@/components/auth/route-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useDirectMessages,
  useMessageThreads,
} from '@/hooks/use-store'
import { useUserRole } from '@/hooks/use-user-role'
import { mockAdvisors, getActiveAdvisors } from '@/lib/data/mock-advisors'
import { formatDateTime } from '@/lib/utils/format'

const MANAGER_USER: { userId: string; name: string } = {
  userId: 'manager-default',
  name: 'James Wilson (Manager)',
}

/**
 * Manager ↔ adviser messaging (SRD-M18).
 *
 * A lightweight in-app messenger backed by the local store. Notifications fire
 * to the recipient via pushNotification() so SRD-A09 / M07 stay coherent.
 */
function MessagesPageInner() {
  const { user, role } = useUserRole()
  const { threads, create: createThread } = useMessageThreads(user.userId)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)

  useEffect(() => {
    if (selectedId === null && threads.length > 0) {
      setSelectedId(threads[0].id)
    }
  }, [threads, selectedId])

  const activeThread = threads.find(thread => thread.id === selectedId) ?? null

  return (
    <>
      <AdminHeader title="Messages" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <MessagesSquare className="size-5 text-primary" />
                Messages
              </h1>
              <p className="text-muted-foreground">
                {role === 'manager'
                  ? 'Coordinate with advisers in dedicated threads.'
                  : 'Stay in touch with your manager and collaborators.'}
              </p>
            </div>
            <Button onClick={() => setComposeOpen(true)}>
              <Plus className="mr-2 size-4" />
              New thread
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-[280px_1fr]">
            <Card className="rounded-2xl border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Threads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {threads.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No threads yet. Start a new conversation.
                  </p>
                ) : (
                  threads.map(thread => {
                    const otherNames = thread.participantNames
                      .filter((_, idx) => thread.participantIds[idx] !== user.userId)
                      .join(', ')
                    return (
                      <button
                        key={thread.id}
                        type="button"
                        onClick={() => setSelectedId(thread.id)}
                        className={`w-full text-left rounded-lg border p-2 transition-colors ${
                          selectedId === thread.id
                            ? 'bg-primary/10 border-primary/30'
                            : 'hover:bg-muted/40 border-transparent'
                        }`}
                      >
                        <p className="text-sm font-medium truncate">{thread.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {otherNames || 'Just you'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDateTime(thread.lastMessageAt)}
                        </p>
                      </button>
                    )
                  })
                )}
              </CardContent>
            </Card>

            <ConversationView
              thread={activeThread}
              currentUserId={user.userId}
              currentUserName={user.name}
              currentUserRole={role === 'fa' ? 'fa' : 'manager'}
            />
          </div>
        </div>
      </main>

      <NewThreadDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        currentUserId={user.userId}
        currentUserName={user.name}
        currentUserRole={role === 'fa' ? 'fa' : 'manager'}
        currentAdvisorId={user.advisorId}
        onCreated={id => setSelectedId(id)}
      />
    </>
  )
}

interface ConversationViewProps {
  thread: ReturnType<typeof useMessageThreads>['threads'][number] | null
  currentUserId: string
  currentUserName: string
  currentUserRole: 'manager' | 'fa'
}

function ConversationView({
  thread,
  currentUserId,
  currentUserName,
  currentUserRole,
}: ConversationViewProps) {
  const { messages, send } = useDirectMessages(thread?.id)
  const [body, setBody] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length, thread?.id])

  if (!thread) {
    return (
      <Card className="rounded-2xl border-border/50">
        <CardContent className="p-12 text-center text-sm text-muted-foreground">
          Select a thread or start a new conversation.
        </CardContent>
      </Card>
    )
  }

  function handleSend() {
    if (!thread) return
    const trimmed = body.trim()
    if (!trimmed) return
    send({
      threadId: thread.id,
      authorId: currentUserId,
      authorName: currentUserName,
      authorRole: currentUserRole,
      body: trimmed,
    })
    setBody('')
  }

  return (
    <Card className="rounded-2xl border-border/50 flex flex-col h-[60vh] min-h-[480px]">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base">{thread.subject}</CardTitle>
        <CardDescription className="flex flex-wrap gap-2 items-center">
          <Users className="size-3" />
          {thread.participantNames.join(', ')}
          {thread.clientName && (
            <Badge variant="outline" className="text-[10px]">
              About {thread.clientName}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef as never}>
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No messages yet. Say hello.</p>
        ) : (
          messages.map(message => {
            const mine = message.authorId === currentUserId
            return (
              <div
                key={message.id}
                className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    mine
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {message.body}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {message.authorName} · {formatDateTime(message.createdAt)}
                </p>
              </div>
            )
          })
        )}
      </CardContent>
      <div className="border-t p-3 flex gap-2">
        <Textarea
          value={body}
          onChange={event => setBody(event.target.value)}
          rows={2}
          placeholder="Write a message…"
          className="resize-none text-sm"
          onKeyDown={event => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              handleSend()
            }
          }}
        />
        <Button onClick={handleSend} disabled={!body.trim()} className="self-end">
          <Send className="mr-2 size-4" />
          Send
        </Button>
      </div>
    </Card>
  )
}

interface NewThreadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
  currentUserName: string
  currentUserRole: 'manager' | 'fa'
  currentAdvisorId?: string
  onCreated: (id: string) => void
}

function NewThreadDialog({
  open,
  onOpenChange,
  currentUserId,
  currentUserName,
  currentUserRole,
  currentAdvisorId,
  onCreated,
}: NewThreadDialogProps) {
  const { create } = useMessageThreads()
  const [subject, setSubject] = useState('')
  const [participant, setParticipant] = useState('')

  const candidates = useMemo(() => {
    if (currentUserRole === 'manager') {
      return getActiveAdvisors().map(advisor => ({
        userId: advisor.id,
        name: advisor.name,
      }))
    }
    // For an adviser the only direct counterpart in the prototype is the manager.
    return [MANAGER_USER]
  }, [currentUserRole])

  useEffect(() => {
    if (!open) return
    setSubject('')
    setParticipant(candidates[0]?.userId ?? '')
  }, [open, candidates])

  function handleCreate() {
    if (!subject.trim() || !participant) return
    const other = candidates.find(c => c.userId === participant)
    if (!other) return
    const thread = create({
      kind: 'manager_advisor',
      subject: subject.trim(),
      participantIds: [currentUserId, other.userId],
      participantNames: [currentUserName, other.name],
    })
    onCreated(thread.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New thread</DialogTitle>
          <DialogDescription>
            Start a conversation with {currentUserRole === 'manager' ? 'an adviser' : 'your manager'}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Subject</label>
            <Input
              value={subject}
              onChange={event => setSubject(event.target.value)}
              placeholder="e.g. CLT001 portfolio rebalancing"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Participant</label>
            <Select value={participant} onValueChange={setParticipant}>
              <SelectTrigger>
                <SelectValue placeholder="Choose someone" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map(candidate => (
                  <SelectItem key={candidate.userId} value={candidate.userId}>
                    {candidate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!subject.trim() || !participant}>
            Start thread
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function MessagesPage() {
  return (
    <RouteGuard allowedRoles={['manager', 'fa']}>
      <MessagesPageInner />
    </RouteGuard>
  )
}
