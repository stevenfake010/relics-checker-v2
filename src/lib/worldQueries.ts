import { deleteCheckin, fetchCheckinRows, saveCheckin } from './checkinApi'
import type { UserId } from '../contexts/IdentityContext'

export interface WorldCheckin {
  user_id: string
  site_id: string
  checked_at: string
}

export async function fetchWorldCheckins(): Promise<WorldCheckin[]> {
  try {
    return await fetchCheckinRows<WorldCheckin>('world')
  } catch (error) {
    console.error('[worldQueries] fetch error:', error)
    return []
  }
}

export async function addWorldCheckin(userId: UserId, siteId: string): Promise<WorldCheckin> {
  return saveCheckin<WorldCheckin>('world', userId, siteId)
}

export async function removeWorldCheckin(userId: UserId, siteId: string): Promise<void> {
  await deleteCheckin('world', userId, siteId)
}
