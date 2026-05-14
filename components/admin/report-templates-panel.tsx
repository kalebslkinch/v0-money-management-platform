'use client'

/**
 * Standardised report templates panel (SRD-G09, SRD-U14).
 *
 * Lists built-in standardised templates filtered by scope, plus any user-saved
 * templates. Users can save the current report state as a new template via
 * the "Save current view" callback.
 */

import { useState } from 'react'
import { FileText, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useReportTemplates } from '@/hooks/use-store'
import type { ReportTemplate } from '@/lib/types/store'

interface ReportTemplatesPanelProps {
  scope: ReportTemplate['scope']
  /**
   * Snapshot of the current Reports page filter / chart state. When provided,
   * the user can press "Save current view" to persist it as a custom template.
   */
  currentConfig?: Record<string, unknown>
  /** Optional handler invoked when a template is selected. */
  onApply?: (template: ReportTemplate) => void
}

export function ReportTemplatesPanel({
  scope,
  currentConfig,
  onApply,
}: ReportTemplatesPanelProps) {
  const { templates, create, remove } = useReportTemplates(scope)
  const [saveOpen, setSaveOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const builtIns = templates.filter(template => template.builtIn)
  const userTemplates = templates.filter(template => !template.builtIn)

  function handleSave() {
    if (!name.trim() || !currentConfig) return
    create({
      name: name.trim(),
      description: description.trim() || undefined,
      scope,
      config: currentConfig,
    })
    setSaveOpen(false)
    setName('')
    setDescription('')
  }

  return (
    <>
      <Card className="rounded-2xl border-border/50">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              Report templates
            </CardTitle>
            <CardDescription>
              Pick a standardised template, or save the current view to reuse later.
            </CardDescription>
          </div>
          {currentConfig && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSaveOpen(true)}
            >
              <Plus className="mr-2 size-3.5" />
              Save current view
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
              Standardised
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {builtIns.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onApply?.(template)}
                  className="text-left rounded-lg border bg-muted/20 p-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{template.name}</p>
                    <Badge variant="outline" className="text-[10px]">Built-in</Badge>
                  </div>
                  {template.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {userTemplates.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
                Saved by you
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {userTemplates.map(template => (
                  <div
                    key={template.id}
                    className="rounded-lg border bg-card p-3 flex items-start justify-between gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => onApply?.(template)}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm font-medium">{template.name}</p>
                      {template.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      )}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(template.id)}
                      aria-label={`Delete ${template.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save current view as template</DialogTitle>
            <DialogDescription>
              The current filters and chart selections will be saved so you can
              re-apply them with one click.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Template name"
              autoFocus
            />
            <Textarea
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="Optional description"
              rows={2}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
