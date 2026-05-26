import { supabase } from './supabase'

export interface GuobaoCheckin {
  user_id: string
  site_id: string
  checked_at: string
  photo_url?: string | null
}

export async function fetchGuobaoCheckins(): Promise<GuobaoCheckin[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('guobao_checkins')
    .select('user_id, site_id, checked_at, photo_url')
    .order('checked_at', { ascending: false })
  if (error) {
    console.error('[guobaoQueries] fetch error:', error)
    return []
  }
  return data ?? []
}

export async function addGuobaoCheckin(userId: string, siteId: string): Promise<GuobaoCheckin | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('guobao_checkins')
    .upsert({ user_id: userId, site_id: siteId, checked_at: new Date().toISOString() } as never)
    .select('user_id, site_id, checked_at, photo_url')
    .single()
  if (error) {
    console.error('[guobaoQueries] add error:', error)
    return null
  }
  return data
}

export async function removeGuobaoCheckin(userId: string, siteId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('guobao_checkins')
    .delete()
    .eq('user_id', userId)
    .eq('site_id', siteId)
  if (error) {
    console.error('[guobaoQueries] remove error:', error)
  }
}

export async function updateGuobaoCheckinPhoto(userId: string, siteId: string, photoUrl: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('guobao_checkins')
    .update({ photo_url: photoUrl } as never)
    .eq('user_id', userId)
    .eq('site_id', siteId)
  if (error) {
    console.error('[guobaoQueries] update photo error:', error)
  }
}

export async function deleteGuobaoCheckinPhoto(userId: string, siteId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('guobao_checkins')
    .update({ photo_url: null } as never)
    .eq('user_id', userId)
    .eq('site_id', siteId)
  if (error) {
    console.error('[guobaoQueries] delete photo error:', error)
  }
}
