'use client'

/**
 * Adviser internal client notes panel (SRD-A07).
 *
 * Renders inside the manager/adviser client-detail page. Customers never
 * render this component. Notes are scoped per-client and tagged so they
 * are filterable; pinned notes float to the top.
 */

import { useState } from 'react'
import { MessageSquarePlus, Pin, PinOff, Tag, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useClientNotes } from '@/hooks/use-store'
import { useUserRole } from '@/hooks/use-user-role'
import { formatDate } from '@/lib/utils/format'

interface ClientNotesPanelProps {
  clientId: string
  clientName: string
}

export function ClientNotesPanel({ clientId, clientName }: ClientNotesPanelProps) {
  const { user, role } = useUserRole()
  const { notes, create, update, remove } = useClientNotes(clientId)

  const [content, setContent] = useState('')
  const [tagDraft, setTagDraft] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const canEdit = role === 'manager' || role === 'fa'
  if (!canEdit) return null

  const ordered = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  function addTag() {
    const trimmed = tagDraft.trim()
    if (!trimmed || tags.includes(trimmed)) {
      setTagDraft('')
      return
    }
    setTags([...tags, trimmed])
    setTagDraft('')
  }

  function handleAdd() {
    const trimmed = content.trim()
    if (!trimmed) return
    create({
      clientId,
      authorId: user.userId,
      authorName: user.name,
      content: trimmed,
      tags,
    })
    setContent('')
    setTags([])
    setTagDraft('')
  }

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquarePlus className="size-4 text-primary" />
          Internal notes
        </CardTitle>
        <CardDescription>
          Private to {role === 'manager' ? 'the management team' : 'advisers'}. {clientName} will not see these notes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-xl border bg-muted/20 p-3">
          <Textarea
            value={content}
            onChange={event => setContent(event.target.value)}
            rows={3}
            placeholder="Add an internal observation, follow-up, or tag a risk…"
            className="resize-none text-sm bg-background"
          />
          <div className="flex items-center gap-2">
            <Tag className="size-3 text-muted-foreground" />
            <Input
              value={tagDraft}
              onChange={event => setTagDraft(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addTag()
                }
              }}
              placeholder="Add a tag (e.g. risk, follow-up)"
              className="h-8 text-xs flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={addTag}
              disabled={!tagDraft.trim()}
            >
              Tag
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1 text-[10px]">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter(t => t !== tag))}
                    aria-label={`Remove tag ${tag}`}
                    className="hover:text-destructive"
                  >
                    <X className="size-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAdd} disabled={!content.trim()}>
              Add note
            </Button>
          </div>
        </div>

        {ordered.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No internal notes yet.</p>
        ) : (
          <div className="space-y-2">
            {ordered.map(note => (
              <div
                key={note.id}
                className="rounded-lg border bg-card p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1">
                    {note.pinned && (
                      <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 text-primary">
                        <Pin className="size-2.5" />
                        Pinned
                      </Badge>
                    )}
                    {note.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground"
                      onClick={() => update(note.id, { pinned: !note.pinned })}
                      aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                    >
                      {note.pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(note.id)}
                      aria-label="Delete note"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                <p className="text-xs text-muted-foreground">
                  {note.authorName} · {formatDate(note.updatedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
