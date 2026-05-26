import { supabase } from './supabase'

export interface HeritageCheckin {
  user_id: string
  site_id: string
  checked_at: string
  photo_url?: string | null
}

export async function fetchHeritageCheckins(): Promise<HeritageCheckin[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('heritage_checkins')
    .select('user_id, site_id, checked_at, photo_url')
    .order('checked_at', { ascending: false })
  if (error) {
    console.error('[heritageQueries] fetch error:', error)
    return []
  }
  return (data as HeritageCheckin[]) ?? []
}

export async function addHeritageCheckin(userId: string, siteId: string, photoUrl?: string): Promise<HeritageCheckin | null> {
  if (!supabase) return null
  const row: Record<string, unknown> = { user_id: userId, site_id: siteId }
  if (photoUrl) row.photo_url = photoUrl
  const { data, error } = await supabase
    .from('heritage_checkins')
    .upsert(row as never, { onConflict: 'user_id,site_id' } as never)
    .select('user_id, site_id, checked_at, photo_url')
    .single()
  if (error) {
    console.error('[heritageQueries] add error:', error)
    return null
  }
  return data as HeritageCheckin
}

export async function updateHeritageCheckinPhoto(userId: string, siteId: string, photoUrl: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('heritage_checkins')
    .update({ photo_url: photoUrl } as never)
    .eq('user_id', userId)
    .eq('site_id', siteId)
  if (error) {
    console.error('[heritageQueries] update photo error:', error)
  }
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
