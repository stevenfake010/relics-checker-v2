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
    let intervalId: number | null = null

    const refreshCheckins = () => {
      for (const queryKey of CHECKIN_QUERY_KEYS) {
        queryClient.refetchQueries({ queryKey, type: 'active' })
      }
    }

    const stop = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId)
        intervalId = null
      }
    }

    const start = () => {
      if (document.visibilityState !== 'visible' || intervalId !== null) return
      intervalId = window.setInterval(refreshCheckins, REFRESH_INTERVAL_MS)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshCheckins()
        start()
      } else {
        stop()
      }
    }

    start()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [queryClient])
}
