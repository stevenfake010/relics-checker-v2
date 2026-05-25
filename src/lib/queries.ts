import { supabase } from './supabase'

export interface Checkin {
  user_id: string
  relic_id: number
  checked_at: string
}

// Fetch all checkins
export async function fetchCheckins(): Promise<Checkin[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('checkins')
    .select('user_id, relic_id, checked_at')
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
    .select('user_id, relic_id, checked_at')
    .single()
  if (error) {
    console.error('[queries] addCheckin error:', error)
    return null
  }
  return data as Checkin
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
