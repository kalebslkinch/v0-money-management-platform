/**
 * Unified export utilities used across reports and visualisations
 * to satisfy SRD-G06 (unified export function).
 *
 * Currently supports CSV; designed so additional formats can be added in
 * one place without changing the call-sites.
 */

export type ExportFormat = 'csv'

export interface ExportColumn<T> {
  key: keyof T | string
  label: string
  /** Optional value getter; receives the row and should return a primitive. */
  value?: (row: T) => string | number | boolean | null | undefined
}

function escapeCsvCell(input: unknown): string {
  if (input === null || input === undefined) return ''
  const str = String(input)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function toCsv<T>(rows: T[], columns: ExportColumn<T>[]): string {
  const header = columns.map(col => escapeCsvCell(col.label)).join(',')
  const body = rows.map(row =>
    columns
      .map(col => {
        const raw = col.value ? col.value(row) : (row as Record<string, unknown>)[col.key as string]
        return escapeCsvCell(raw)
      })
      .join(','),
  )
  return [header, ...body].join('\n')
}

/**
 * Trigger a browser download for the given content. Safe to call from
 * client-side React event handlers only.
 */
export function downloadBlob(content: string, filename: string, mimeType = 'text/csv;charset=utf-8'): void {
  if (typeof window === 'undefined') return
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export interface ExportOptions<T> {
  rows: T[]
  columns: ExportColumn<T>[]
  filename: string
  format?: ExportFormat
}

/**
 * Single entry point used by every export action across the app.
 */
export function exportData<T>({ rows, columns, filename, format = 'csv' }: ExportOptions<T>): void {
  if (format === 'csv') {
    const csv = toCsv(rows, columns)
    const finalName = filename.endsWith('.csv') ? filename : `${filename}.csv`
    downloadBlob(csv, finalName)
    return
  }
}
