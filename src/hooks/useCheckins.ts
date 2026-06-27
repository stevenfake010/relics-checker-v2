import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCheckins, addCheckin, removeCheckin, type Checkin } from '../lib/queries'
import type { UserId } from '../contexts/IdentityContext'
import { celebrateCheckin } from '../utils/celebrate'

export const CHECKINS_KEY = ['checkins'] as const

// Returns Set<`${userId}:${relicId}`> for O(1) lookup
export type CheckinSet = Set<string>

function toCheckinSet(checkins: Checkin[]): CheckinSet {
  return new Set(checkins.map((c) => `${c.user_id}:${c.relic_id}`))
}

export function useCheckins() {
  return useQuery({
    queryKey: CHECKINS_KEY,
    queryFn: fetchCheckins,
    staleTime: 30_000,
  })
}

export function useCheckinSet() {
  const { data } = useCheckins()
  return toCheckinSet(data ?? [])
}

export function useIsChecked(userId: UserId | null, relicId: number) {
  const set = useCheckinSet()
  if (!userId) return false
  return set.has(`${userId}:${relicId}`)
}

export function useToggleCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      relicId,
      checked,
    }: {
      userId: UserId
      relicId: number
      checked: boolean
    }) => {
      if (checked) {
        await removeCheckin(userId, relicId)
      } else {
        await addCheckin(userId, relicId)
      }
    },

    onMutate: async ({ userId, relicId, checked }) => {
      await queryClient.cancelQueries({ queryKey: CHECKINS_KEY })
      const previous = queryClient.getQueryData<Checkin[]>(CHECKINS_KEY) ?? []

      // Optimistic update
      let updated: Checkin[]
      if (checked) {
        updated = previous.filter(
          (c) => !(c.user_id === userId && c.relic_id === relicId)
        )
      } else {
        // 新打卡时触发庆祝
        try {
          celebrateCheckin(userId)
        } catch {
          /* ignore */
        }
        const newCheckin: Checkin = {
          user_id: userId,
          relic_id: relicId,
          checked_at: new Date().toISOString(),
        }
        updated = [newCheckin, ...previous]
      }

      queryClient.setQueryData<Checkin[]>(CHECKINS_KEY, updated)
      return { previous }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData<Checkin[]>(CHECKINS_KEY, ctx.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CHECKINS_KEY })
    },
  })
}
