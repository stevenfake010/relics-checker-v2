import { deleteCheckin, fetchCheckinRows, saveCheckin, updateCheckinPhoto as updatePhoto } from './checkinApi'
import type { UserId } from '../contexts/IdentityContext'
import { deleteCheckinPhotoObject } from './cosUpload'

export interface GuobaoCheckin {
  user_id: string
  site_id: string
  checked_at: string
  photo_url?: string | null
}

export async function fetchGuobaoCheckins(): Promise<GuobaoCheckin[]> {
  return fetchCheckinRows<GuobaoCheckin>('guobao')
}

export async function addGuobaoCheckin(
  userId: UserId,
  siteId: string,
  photoUrl?: string
): Promise<GuobaoCheckin> {
  return saveCheckin<GuobaoCheckin>('guobao', userId, siteId, photoUrl)
}

export async function removeGuobaoCheckin(userId: UserId, siteId: string): Promise<void> {
  await deleteCheckin('guobao', userId, siteId)
}

export async function updateGuobaoCheckinPhoto(userId: UserId, siteId: string, photoUrl: string): Promise<void> {
  await updatePhoto('guobao', userId, siteId, photoUrl)
}

export async function deleteGuobaoCheckinPhoto(userId: UserId, siteId: string, photoUrl?: string): Promise<void> {
  await updatePhoto('guobao', userId, siteId, null)
  if (photoUrl) {
    try {
      await deleteCheckinPhotoObject(photoUrl)
    } catch (err) {
      console.warn('Failed to delete COS photo object:', err)
    }
  }
}
