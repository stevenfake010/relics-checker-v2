import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { CHECKINS_KEY } from './useCheckins'
import { HERITAGE_CHECKINS_KEY } from './useHeritageCheckins'

export function useRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!supabase) return

    const relicChannel = supabase
      .channel('checkins-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'checkins' },
        () => {
          queryClient.invalidateQueries({ queryKey: CHECKINS_KEY })
        }
      )
      .subscribe()

    const heritageChannel = supabase
      .channel('heritage-checkins-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'heritage_checkins' },
        () => {
          queryClient.invalidateQueries({ queryKey: HERITAGE_CHECKINS_KEY })
        }
      )
      .subscribe()

    return () => {
      supabase?.removeChannel(relicChannel)
      supabase?.removeChannel(heritageChannel)
    }
  }, [queryClient])
}
