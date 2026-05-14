'use client'

import { useMemo, useState } from 'react'
import { BookOpen, Search, Filter, Clock, Tag } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { RouteGuard } from '@/components/auth/route-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LEARNING_RESOURCES,
  type LearningResource,
  type LearningResourceType,
} from '@/lib/data/learning-hub'
import { formatDate } from '@/lib/utils/format'

const TYPE_LABELS: Record<LearningResourceType, string> = {
  compliance: 'Compliance',
  market: 'Market',
  product: 'Product',
  process: 'Process',
}

const TYPE_TONE: Record<LearningResourceType, string> = {
  compliance: 'bg-destructive/10 text-destructive border-destructive/20',
  market: 'bg-primary/10 text-primary border-primary/20',
  product: 'bg-success/10 text-success border-success/20',
  process: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
}

/**
 * Adviser Learning Hub (SRD-A15).
 *
 * Filterable feed of compliance updates, market briefings, product notes and
 * platform process tips. Built from a static curated source today; in
 * production this would be backed by a CMS.
 */
function LearningHubInner() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<LearningResourceType | 'all'>('all')

  const ordered = useMemo<LearningResource[]>(() => {
    const term = search.toLowerCase().trim()
    return LEARNING_RESOURCES
      .filter(resource => type === 'all' || resource.type === type)
      .filter(resource => {
        if (!term) return true
        return (
          resource.title.toLowerCase().includes(term) ||
          resource.summary.toLowerCase().includes(term) ||
          resource.tags.some(tag => tag.toLowerCase().includes(term))
        )
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  }, [search, type])

  return (
    <>
      <AdminHeader title="Learning Hub" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              Learning Hub
            </h1>
            <p className="text-muted-foreground">
              Curated compliance updates, market briefings, and process tips for advisers.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filter resources</CardTitle>
              <CardDescription>Search by topic, tag, or content type.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Search title, summary, or tag"
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-muted-foreground" />
                  <Select value={type} onValueChange={value => setType(value as LearningResourceType | 'all')}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="process">Process</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {ordered.length === 0 ? (
              <Card className="sm:col-span-2">
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No resources match the current filters.
                </CardContent>
              </Card>
            ) : (
              ordered.map(resource => (
                <Card key={resource.id} className="rounded-2xl border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-tight">
                        {resource.title}
                      </CardTitle>
                      <Badge variant="outline" className={`text-[10px] ${TYPE_TONE[resource.type]}`}>
                        {TYPE_LABELS[resource.type]}
                      </Badge>
                    </div>
                    <CardDescription>{resource.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {resource.readTimeMinutes} min · {formatDate(resource.publishedAt)}
                    </span>
                    {resource.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1 text-[10px]">
                        <Tag className="size-2.5" />
                        {tag}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default function LearningHubPage() {
  return (
    <RouteGuard allowedRoles={['manager', 'fa']}>
      <LearningHubInner />
    </RouteGuard>
  )
}
