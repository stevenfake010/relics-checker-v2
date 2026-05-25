import { supabase } from './supabase'

export interface HeritageCheckin {
  user_id: string
  site_id: string
  checked_at: string
}

export async function fetchHeritageCheckins(): Promise<HeritageCheckin[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('heritage_checkins')
    .select('user_id, site_id, checked_at')
    .order('checked_at', { ascending: false })
  if (error) {
    console.error('[heritageQueries] fetch error:', error)
    return []
  }
  return (data as HeritageCheckin[]) ?? []
}

export async function addHeritageCheckin(userId: string, siteId: string): Promise<HeritageCheckin | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('heritage_checkins')
    .upsert(
      { user_id: userId, site_id: siteId } as never,
      { onConflict: 'user_id,site_id' } as never
    )
    .select('user_id, site_id, checked_at')
    .single()
  if (error) {
    console.error('[heritageQueries] add error:', error)
    return null
  }
  return data as HeritageCheckin
}

export async function removeHeritageCheckin(userId: string, siteId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('heritage_checkins')
    .delete()
    .eq('user_id', userId)
    .eq('site_id', siteId)
  if (error) {
    console.error('[heritageQueries] remove error:', error)
  }
}
