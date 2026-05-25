import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { CHECKINS_KEY } from './useCheckins'

export function useRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!supabase) return // No Supabase → no realtime

    const channel = supabase
      .channel('checkins-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'checkins' },
        () => {
          // Invalidate and refetch on any change
          queryClient.invalidateQueries({ queryKey: CHECKINS_KEY })
        }
      )
      .subscribe()

    return () => {
      supabase?.removeChannel(channel)
    }
  }, [queryClient])
}
