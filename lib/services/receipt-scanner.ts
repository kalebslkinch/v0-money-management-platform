/**
 * Mock receipt OCR + auto-recognition (SRD-U16, SRD-A12).
 *
 * In production this would POST the image to an OCR service (Textract,
 * Azure Form Recognizer, or a vendor receipt API) and map the response to
 * a UserTransaction draft. For the prototype we deterministically derive
 * a plausible draft from the file metadata so the UX is identical from
 * the user's perspective: pick image → extracted fields appear in the
 * transaction form for review and confirmation.
 *
 * The function is intentionally synchronous after the file load so that
 * call-sites can `await` it and treat it as the "real" OCR call.
 */

import type { PaymentMethod } from '@/lib/types/store'

export interface ExtractedReceipt {
  /** Best-guess merchant name. */
  merchant: string
  /** Best-guess transaction date (YYYY-MM-DD). Defaults to today. */
  date: string
  /** Total in GBP. */
  amount: number
  /** Best-guess payment method. */
  paymentMethod: PaymentMethod
  /** Suggested category label – the form will map to a real category id. */
  suggestedCategory: string
  /** Confidence score 0-1 returned by the (simulated) OCR engine. */
  confidence: number
}

export interface ScannedReceiptResult {
  /** Original file as a data URL — also used as the receipt attachment. */
  dataUrl: string
  filename: string
  mimeType: string
  size: number
  /** Extracted structured fields. */
  extracted: ExtractedReceipt
}

/** Simple deterministic hash so identical filenames give identical extractions. */
function hashString(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

const MERCHANT_BUCKETS: { match: RegExp; merchant: string; category: string }[] = [
  { match: /tesco/i,       merchant: 'Tesco Superstore',   category: 'Tesco Grocery' },
  { match: /sainsbur/i,    merchant: "Sainsbury's",        category: 'Tesco Grocery' },
  { match: /aldi/i,        merchant: 'Aldi',               category: 'Tesco Grocery' },
  { match: /uber\s*eats|deliveroo|just\s*eat/i, merchant: 'Uber Eats', category: 'Food Delivery' },
  { match: /uber|bolt|tfl|train|rail/i, merchant: 'Transport for London', category: 'Transport' },
  { match: /netflix|spotify|disney|prime/i, merchant: 'Subscription provider', category: 'Subscriptions' },
  { match: /ikea|argos|b&q|wickes/i, merchant: 'Household goods retailer', category: 'Household' },
]

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * "Scan" a receipt image and return both the attachment payload and the
 * extracted fields that the transaction form should pre-populate. This is a
 * mock implementation suitable for the prototype – it never sends data
 * off-device.
 */
export async function scanReceipt(file: File): Promise<ScannedReceiptResult> {
  const dataUrl = await fileToDataUrl(file)
  const seed = hashString(file.name + file.size)

  // Pick a merchant bucket from the filename if it matches a known pattern;
  // otherwise pick deterministically based on hash so the UX is reproducible.
  const matched = MERCHANT_BUCKETS.find(bucket => bucket.match.test(file.name))
  const bucket = matched ?? MERCHANT_BUCKETS[seed % MERCHANT_BUCKETS.length]

  const amount = 8 + (seed % 7400) / 100 // 8.00 – 81.99
  const paymentMethods: PaymentMethod[] = ['card', 'bank-transfer', 'cash']
  const paymentMethod = paymentMethods[seed % paymentMethods.length]

  const today = new Date().toISOString().slice(0, 10)
  const confidence = 0.7 + (seed % 25) / 100 // 0.70 – 0.94

  return {
    dataUrl,
    filename: file.name,
    mimeType: file.type || 'image/jpeg',
    size: file.size,
    extracted: {
      merchant: bucket.merchant,
      date: today,
      amount: Number(amount.toFixed(2)),
      paymentMethod,
      suggestedCategory: bucket.category,
      confidence: Number(confidence.toFixed(2)),
    },
  }
}
