import { deleteCheckin, fetchCheckinRows, saveCheckin, updateCheckinPhoto as updatePhoto } from './checkinApi'
import type { UserId } from '../contexts/IdentityContext'

export interface Checkin {
  user_id: string
  relic_id: number
  checked_at: string
  photo_url?: string | null
}

// Fetch all checkins
export async function fetchCheckins(): Promise<Checkin[]> {
  try {
    return await fetchCheckinRows<Checkin>('relics')
  } catch (error) {
    console.error('[queries] fetchCheckins error:', error)
    return []
  }
}

// Add a checkin
export async function addCheckin(userId: UserId, relicId: number, photoUrl?: string): Promise<Checkin> {
  return saveCheckin<Checkin>('relics', userId, relicId, photoUrl)
}

// Update photo_url for a relic checkin
export async function updateCheckinPhoto(userId: UserId, relicId: number, photoUrl: string): Promise<void> {
  await updatePhoto('relics', userId, relicId, photoUrl)
}

// Delete photo from a relic checkin
export async function deleteCheckinPhoto(userId: UserId, relicId: number): Promise<void> {
  await updatePhoto('relics', userId, relicId, null)
}

// Remove a checkin
export async function removeCheckin(userId: UserId, relicId: number): Promise<void> {
  await deleteCheckin('relics', userId, relicId)
}
