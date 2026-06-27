import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchHeritageCheckins,
  addHeritageCheckin,
  removeHeritageCheckin,
  type HeritageCheckin,
} from '../lib/heritageQueries'
import type { UserId } from '../contexts/IdentityContext'
import { celebrateCheckin } from '../utils/celebrate'

export const HERITAGE_CHECKINS_KEY = ['heritage_checkins'] as const

export type HeritageCheckinSet = Set<string> // `${userId}:${siteId}`

function toHeritageCheckinSet(checkins: HeritageCheckin[]): HeritageCheckinSet {
  return new Set(checkins.map((c) => `${c.user_id}:${c.site_id}`))
}

export function useHeritageCheckins() {
  return useQuery({
    queryKey: HERITAGE_CHECKINS_KEY,
    queryFn: fetchHeritageCheckins,
    staleTime: 30_000,
  })
}

export function useHeritageCheckinSet() {
  const { data } = useHeritageCheckins()
  return toHeritageCheckinSet(data ?? [])
}

export function useIsHeritageChecked(userId: UserId | null, siteId: string) {
  const set = useHeritageCheckinSet()
  if (!userId) return false
  return set.has(`${userId}:${siteId}`)
}

export function useToggleHeritageCheckin() {
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
      if (checked) {
        await removeHeritageCheckin(userId, siteId)
      } else {
        await addHeritageCheckin(userId, siteId)
      }
    },

    onMutate: async ({ userId, siteId, checked }) => {
      await queryClient.cancelQueries({ queryKey: HERITAGE_CHECKINS_KEY })
      const previous = queryClient.getQueryData<HeritageCheckin[]>(HERITAGE_CHECKINS_KEY) ?? []

      let updated: HeritageCheckin[]
      if (checked) {
        updated = previous.filter(
          (c) => !(c.user_id === userId && c.site_id === siteId)
        )
      } else {
        try {
          celebrateCheckin(userId)
        } catch { /* ignore */ }
        const newCheckin: HeritageCheckin = {
          user_id: userId,
          site_id: siteId,
          checked_at: new Date().toISOString(),
        }
        updated = [newCheckin, ...previous]
      }

      queryClient.setQueryData<HeritageCheckin[]>(HERITAGE_CHECKINS_KEY, updated)
      return { previous }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData<HeritageCheckin[]>(HERITAGE_CHECKINS_KEY, ctx.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HERITAGE_CHECKINS_KEY })
    },
  })
}
