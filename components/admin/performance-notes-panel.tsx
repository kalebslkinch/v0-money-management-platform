'use client'

import { useState } from 'react'
import { MessageSquarePlus, Trash2, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { usePerformanceNotes } from '@/hooks/use-store'
import { formatDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import type { PerformanceNote, PerformanceNoteCategory } from '@/lib/types/store'

const CATEGORY_LABELS: Record<PerformanceNoteCategory, string> = {
  feedback:     'Feedback',
  commendation: 'Commendation',
  improvement:  'Improvement Area',
  performance:  'Performance',
  general:      'General',
}

const CATEGORY_STYLES: Record<PerformanceNoteCategory, string> = {
  feedback:     'bg-primary/10 text-primary border-primary/20',
  commendation: 'bg-success/10 text-success border-success/20',
  improvement:  'bg-warning/10 text-warning border-warning/20',
  performance:  'bg-chart-2/10 text-chart-2 border-chart-2/20',
  general:      'bg-muted text-muted-foreground border-muted',
}

const MANAGER_STUB = { id: 'mgr-001', name: 'Manager' }

interface PerformanceNotesPanelProps {
  memberId: string
  memberName: string
}

export function PerformanceNotesPanel({ memberId, memberName }: PerformanceNotesPanelProps) {
  const { notes, create, remove } = usePerformanceNotes(memberId)
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<PerformanceNoteCategory>('feedback')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    setSubmitting(true)
    create({
      memberId,
      memberName,
      category,
      content: trimmed,
      authorId: MANAGER_STUB.id,
      authorName: MANAGER_STUB.name,
    })
    setContent('')
    setCategory('feedback')
    setSubmitting(false)
    setOpen(false)
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Performance &amp; Feedback Notes</p>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 text-xs"
          onClick={() => setOpen(v => !v)}
        >
          <MessageSquarePlus className="size-3.5" />
          Add Note
        </Button>
      </div>

      {/* Inline add-note form */}
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleContent>
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-3 mb-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="note-category" className="text-xs">Category</Label>
              <Select
                value={category}
                onValueChange={val => setCategory(val as PerformanceNoteCategory)}
              >
                <SelectTrigger id="note-category" className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABELS) as PerformanceNoteCategory[]).map(k => (
                    <SelectItem key={k} value={k} className="text-xs">
                      {CATEGORY_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note-content" className="text-xs">Note</Label>
              <Textarea
                id="note-content"
                placeholder="Write your internal note here…"
                value={content}
                onChange={e => setContent(e.target.value)}
                className="min-h-[80px] text-sm resize-none"
                maxLength={2000}
              />
              <p className="text-[11px] text-muted-foreground text-right">
                {content.length}/2000
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => { setOpen(false); setContent('') }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs"
                disabled={!content.trim() || submitting}
              >
                Save Note
              </Button>
            </div>
          </form>
        </CollapsibleContent>
      </Collapsible>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No notes yet.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map(note => (
            <NoteCard key={note.id} note={note} onDelete={() => remove(note.id)} />
          ))}
        </ul>
      )}
    </div>
  )
}

function NoteCard({
  note,
  onDelete,
}: {
  note: PerformanceNote
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isLong = note.content.length > 120
  const preview = isLong && !expanded ? note.content.slice(0, 120) + '…' : note.content

  return (
    <li className="rounded-lg border border-border/50 bg-card p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <Badge variant="outline" className={cn('text-[11px] h-5', CATEGORY_STYLES[note.category])}>
          {CATEGORY_LABELS[note.category]}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground hover:text-destructive shrink-0"
          onClick={onDelete}
          aria-label="Delete note"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <p className="text-sm whitespace-pre-wrap break-words">{preview}</p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className={cn('size-3 transition-transform', expanded && 'rotate-180')} />
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      <p className="text-[11px] text-muted-foreground">
        By {note.authorName} · {formatDate(note.createdAt)}
      </p>
    </li>
  )
}
