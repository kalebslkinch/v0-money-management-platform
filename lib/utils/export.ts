/**
 * Unified export utilities used across reports and visualisations
 * to satisfy SRD-G06 (unified export function).
 *
 * Tabular formats: 'csv'
 * Visualisation formats: 'svg' | 'png'  (browser-native, no extra deps)
 */

export type ExportFormat = 'csv'

/** Supported output formats for chart / visualisation export. */
export type VisualizationFormat = 'svg' | 'png'

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

// ─── Visualisation export ─────────────────────────────────────────────────────

export interface ExportChartOptions {
  /**
   * The chart's wrapping DOM element (e.g. the div containing
   * <ResponsiveContainer>). The function locates the first <svg> child
   * automatically. You may also pass an SVGSVGElement directly.
   */
  element: SVGElement | HTMLElement
  filename: string
  /** Defaults to 'png'. */
  format?: VisualizationFormat
}

/**
 * Export a rendered SVG-based visualisation (Recharts, D3, …) to SVG or PNG.
 * Uses only browser-native Canvas / Blob APIs — no additional dependencies.
 *
 * Must be called from a client-side event handler. Returns a Promise that
 * resolves once the browser download has been triggered.
 */
export async function exportChart({
  element,
  filename,
  format = 'png',
}: ExportChartOptions): Promise<void> {
  if (typeof window === 'undefined') return

  const svg: SVGElement | null =
    element instanceof SVGElement ? element : element.querySelector('svg')
  if (!svg) return

  const svgString = new XMLSerializer().serializeToString(svg)

  if (format === 'svg') {
    const finalName = filename.endsWith('.svg') ? filename : `${filename}.svg`
    downloadBlob(svgString, finalName, 'image/svg+xml;charset=utf-8')
    return
  }

  // PNG: render the SVG into an off-screen canvas using a data-URL image.
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  await new Promise<void>((resolve, reject) => {
    const img = new Image()
    const rect = svg.getBoundingClientRect()
    const width = rect.width || 800
    const height = rect.height || 400

    img.onload = () => {
      const dpr = window.devicePixelRatio || 1
      const canvas = document.createElement('canvas')
      canvas.width = width * dpr
      canvas.height = height * dpr

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        resolve()
        return
      }

      ctx.scale(dpr, dpr)
      // Fill white so transparent SVG backgrounds export cleanly.
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)

      canvas.toBlob(blob => {
        if (!blob) { resolve(); return }
        const pngUrl = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = pngUrl
        anchor.download = filename.endsWith('.png') ? filename : `${filename}.png`
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        URL.revokeObjectURL(pngUrl)
        resolve()
      }, 'image/png')
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('exportChart: failed to render SVG to image'))
    }

    img.src = url
  })
}
