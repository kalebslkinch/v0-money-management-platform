import type { ChangeRequest, ChangeRequestStatus } from '@/lib/types/admin'

// In-memory store — survives within the browser session
const store: ChangeRequest[] = []

export function addChangeRequest(req: Omit<ChangeRequest, 'id' | 'requestedAt' | 'status'>): ChangeRequest {
  const newReq: ChangeRequest = {
    ...req,
    id: `CHR${Date.now()}`,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  }
  store.push(newReq)
  return newReq
}

export function getChangeRequestsByClientId(clientId: string): ChangeRequest[] {
  return store.filter(r => r.clientId === clientId)
}

export function getPendingRequestsByClientId(clientId: string): ChangeRequest[] {
  return store.filter(r => r.clientId === clientId && r.status === 'pending')
}

export function updateChangeRequestStatus(id: string, status: ChangeRequestStatus): void {
  const req = store.find(r => r.id === id)
  if (req) req.status = status
}

export function getPendingRequestCount(): number {
  return store.filter(r => r.status === 'pending').length
}
