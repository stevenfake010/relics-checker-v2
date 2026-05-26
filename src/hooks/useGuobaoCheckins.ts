import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchGuobaoCheckins,
  addGuobaoCheckin,
  removeGuobaoCheckin,
  type GuobaoCheckin,
} from '../lib/guobaoQueries'
import { hasSupabase } from '../lib/supabase'
import type { UserId } from '../contexts/IdentityContext'
import { celebrateCheckin } from '../utils/celebrate'

export const GUOBAO_CHECKINS_KEY = ['guobao_checkins'] as const

export type GuobaoCheckinSet = Set<string> // `${userId}:${siteId}`

function toGuobaoCheckinSet(checkins: GuobaoCheckin[]): GuobaoCheckinSet {
  return new Set(checkins.map((c) => `${c.user_id}:${c.site_id}`))
}

export function useGuobaoCheckins() {
  return useQuery({
    queryKey: GUOBAO_CHECKINS_KEY,
    queryFn: fetchGuobaoCheckins,
    staleTime: 30_000,
  })
}

export function useGuobaoCheckinSet() {
  const { data } = useGuobaoCheckins()
  return toGuobaoCheckinSet(data ?? [])
}

export function useToggleGuobaoCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      siteId,
      checked,
    }: {
      userId: UserId
      siteId: string
      checked: boolean
    }) => {
      if (!hasSupabase) return
      if (checked) {
        await removeGuobaoCheckin(userId, siteId)
      } else {
        await addGuobaoCheckin(userId, siteId)
      }
    },

    onMutate: async ({ userId, siteId, checked }) => {
      await queryClient.cancelQueries({ queryKey: GUOBAO_CHECKINS_KEY })
      const previous = queryClient.getQueryData<GuobaoCheckin[]>(GUOBAO_CHECKINS_KEY) ?? []

      let updated: GuobaoCheckin[]
      if (checked) {
        updated = previous.filter(
          (c) => !(c.user_id === userId && c.site_id === siteId)
        )
      } else {
        try {
          celebrateCheckin(userId)
        } catch { /* ignore */ }
        const newCheckin: GuobaoCheckin = {
          user_id: userId,
          site_id: siteId,
          checked_at: new Date().toISOString(),
        }
        updated = [newCheckin, ...previous]
      }

      queryClient.setQueryData<GuobaoCheckin[]>(GUOBAO_CHECKINS_KEY, updated)
      return { previous }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData<GuobaoCheckin[]>(GUOBAO_CHECKINS_KEY, ctx.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GUOBAO_CHECKINS_KEY })
    },
  })
}
