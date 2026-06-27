import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchWorldCheckins,
  addWorldCheckin,
  removeWorldCheckin,
  type WorldCheckin,
} from '../lib/worldQueries'
import type { UserId } from '../contexts/IdentityContext'
import { celebrateCheckin } from '../utils/celebrate'

export const WORLD_CHECKINS_KEY = ['world_checkins'] as const

export type WorldCheckinSet = Set<string> // `${userId}:${siteId}`

function toWorldCheckinSet(checkins: WorldCheckin[]): WorldCheckinSet {
  return new Set(checkins.map((c) => `${c.user_id}:${c.site_id}`))
}

export function useWorldCheckins() {
  return useQuery({
    queryKey: WORLD_CHECKINS_KEY,
    queryFn: fetchWorldCheckins,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  })
}

export function useWorldCheckinSet() {
  const { data } = useWorldCheckins()
  return toWorldCheckinSet(data ?? [])
}

export function useToggleWorldCheckin() {
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
        await removeWorldCheckin(userId, siteId)
      } else {
        await addWorldCheckin(userId, siteId)
      }
    },

    onMutate: async ({ userId, siteId, checked }) => {
      await queryClient.cancelQueries({ queryKey: WORLD_CHECKINS_KEY })
      const previous = queryClient.getQueryData<WorldCheckin[]>(WORLD_CHECKINS_KEY) ?? []

      let updated: WorldCheckin[]
      if (checked) {
        updated = previous.filter(
          (c) => !(c.user_id === userId && c.site_id === siteId)
        )
      } else {
        try {
          celebrateCheckin(userId)
        } catch { /* ignore */ }
        const newCheckin: WorldCheckin = {
          user_id: userId,
          site_id: siteId,
          checked_at: new Date().toISOString(),
        }
        updated = [newCheckin, ...previous]
      }

      queryClient.setQueryData<WorldCheckin[]>(WORLD_CHECKINS_KEY, updated)
      return { previous }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData<WorldCheckin[]>(WORLD_CHECKINS_KEY, ctx.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WORLD_CHECKINS_KEY })
    },
  })
}
