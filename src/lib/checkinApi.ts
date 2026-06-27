import { getAuthedUserId, getAuthToken } from './auth'
import type { UserId } from '../contexts/IdentityContext'

export type CheckinTable = 'relics' | 'heritage' | 'world' | 'guobao'

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function assertCurrentUser(userId: UserId): void {
  const authedUserId = getAuthedUserId()
  if (authedUserId !== userId) {
    throw new Error('Authenticated user does not match requested user')
  }
}

async function readJson<T>(resp: Response): Promise<T> {
  const body = (await resp.json().catch(() => ({}))) as T & { error?: string }
  if (!resp.ok) {
    throw new Error(body.error ?? `Request failed: ${resp.status}`)
  }
  return body
}

export async function fetchCheckinRows<T>(table: CheckinTable): Promise<T[]> {
  const resp = await fetch(`/api/checkins?table=${encodeURIComponent(table)}`, {
    headers: getAuthHeaders(),
  })
  const body = await readJson<{ data: T[] }>(resp)
  return body.data ?? []
}

export async function saveCheckin<T>(
  table: CheckinTable,
  userId: UserId,
  itemId: string | number,
  photoUrl?: string | null
): Promise<T> {
  assertCurrentUser(userId)
  const payload: Record<string, unknown> = { table, itemId }
  if (photoUrl !== undefined) payload.photoUrl = photoUrl

  const resp = await fetch('/api/checkins', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  const body = await readJson<{ data: T }>(resp)
  return body.data
}

export async function updateCheckinPhoto(
  table: Exclude<CheckinTable, 'world'>,
  userId: UserId,
  itemId: string | number,
  photoUrl: string | null
): Promise<void> {
  assertCurrentUser(userId)
  const resp = await fetch('/api/checkins', {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ table, itemId, photoUrl }),
  })
  await readJson<{ ok: true }>(resp)
}

export async function deleteCheckin(
  table: CheckinTable,
  userId: UserId,
  itemId: string | number
): Promise<void> {
  assertCurrentUser(userId)
  const resp = await fetch('/api/checkins', {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ table, itemId }),
  })
  await readJson<{ ok: true }>(resp)
}

