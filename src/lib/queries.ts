import { supabase } from './supabase'

export interface Checkin {
  user_id: string
  relic_id: number
  checked_at: string
  photo_url?: string | null
}

// Fetch all checkins
export async function fetchCheckins(): Promise<Checkin[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('checkins')
    .select('user_id, relic_id, checked_at, photo_url')
    .order('checked_at', { ascending: false })
  if (error) {
    console.error('[queries] fetchCheckins error:', error)
    return []
  }
  return (data as Checkin[]) ?? []
}

// Add a checkin
export async function addCheckin(userId: string, relicId: number): Promise<Checkin | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('checkins')
    .upsert(
      { user_id: userId, relic_id: relicId } as never,
      { onConflict: 'user_id,relic_id' } as never
    )
    .select('user_id, relic_id, checked_at, photo_url')
    .single()
  if (error) {
    console.error('[queries] addCheckin error:', error)
    return null
  }
  return data as Checkin
}

// Update photo_url for a relic checkin
export async function updateCheckinPhoto(userId: string, relicId: number, photoUrl: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('checkins')
    .update({ photo_url: photoUrl } as never)
    .eq('user_id', userId)
    .eq('relic_id', relicId)
  if (error) {
    console.error('[queries] updateCheckinPhoto error:', error)
  }
}

// Delete photo from a relic checkin
export async function deleteCheckinPhoto(userId: string, relicId: number): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('checkins')
    .update({ photo_url: null } as never)
    .eq('user_id', userId)
    .eq('relic_id', relicId)
  if (error) {
    console.error('[queries] deleteCheckinPhoto error:', error)
  }
}

// Remove a checkin
export async function removeCheckin(userId: string, relicId: number): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('checkins')
    .delete()
    .eq('user_id', userId)
    .eq('relic_id', relicId)
  if (error) {
    console.error('[queries] removeCheckin error:', error)
  }
}
