import { deleteCheckin, fetchCheckinRows, saveCheckin, updateCheckinPhoto as updatePhoto } from './checkinApi'
import type { UserId } from '../contexts/IdentityContext'

export interface HeritageCheckin {
  user_id: string
  site_id: string
  checked_at: string
  photo_url?: string | null
}

export async function fetchHeritageCheckins(): Promise<HeritageCheckin[]> {
  try {
    return await fetchCheckinRows<HeritageCheckin>('heritage')
  } catch (error) {
    console.error('[heritageQueries] fetch error:', error)
    return []
  }
}

export async function addHeritageCheckin(
  userId: UserId,
  siteId: string,
  photoUrl?: string
): Promise<HeritageCheckin> {
  return saveCheckin<HeritageCheckin>('heritage', userId, siteId, photoUrl)
}

export async function updateHeritageCheckinPhoto(userId: UserId, siteId: string, photoUrl: string): Promise<void> {
  await updatePhoto('heritage', userId, siteId, photoUrl)
}

export async function deleteHeritageCheckinPhoto(userId: UserId, siteId: string): Promise<void> {
  await updatePhoto('heritage', userId, siteId, null)
}

export async function removeHeritageCheckin(userId: UserId, siteId: string): Promise<void> {
  await deleteCheckin('heritage', userId, siteId)
}
