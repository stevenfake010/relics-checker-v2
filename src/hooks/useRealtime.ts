import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CHECKINS_KEY } from './useCheckins'
import { HERITAGE_CHECKINS_KEY } from './useHeritageCheckins'
import { WORLD_CHECKINS_KEY } from './useWorldCheckins'
import { GUOBAO_CHECKINS_KEY } from './useGuobaoCheckins'

const REFRESH_INTERVAL_MS = 60_000

const CHECKIN_QUERY_KEYS = [
  CHECKINS_KEY,
  HERITAGE_CHECKINS_KEY,
  WORLD_CHECKINS_KEY,
  GUOBAO_CHECKINS_KEY,
] as const

export function useRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const refreshCheckins = () => {
      for (const queryKey of CHECKIN_QUERY_KEYS) {
        queryClient.refetchQueries({ queryKey, type: 'active' })
      }
    }

    const intervalId = window.setInterval(refreshCheckins, REFRESH_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [queryClient])
}
