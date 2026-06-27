import { supabase } from './supabase'

export interface WorldCheckin {
  user_id: string
  site_id: string
  checked_at: string
}

export async function fetchWorldCheckins(): Promise<WorldCheckin[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('world_checkins')
    .select('user_id, site_id, checked_at')
    .order('checked_at', { ascending: false })
  if (error) {
    console.error('[worldQueries] fetch error:', error)
    return []
  }
  return data ?? []
}

export async function addWorldCheckin(userId: string, siteId: string): Promise<WorldCheckin | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('world_checkins')
    .upsert({ user_id: userId, site_id: siteId, checked_at: new Date().toISOString() } as never)
    .select('user_id, site_id, checked_at')
    .single()
  if (error) {
    console.error('[worldQueries] add error:', error)
    return null
  }
  return data
}

export async function removeWorldCheckin(userId: string, siteId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('world_checkins')
    .delete()
    .eq('user_id', userId)
    .eq('site_id', siteId)
  if (error) {
    console.error('[worldQueries] remove error:', error)
  }
}
