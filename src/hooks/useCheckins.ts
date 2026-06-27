import { fetchCheckins, addCheckin, removeCheckin, type Checkin } from '../lib/queries'
import type { UserId } from '../contexts/IdentityContext'
import { CHECKIN_RESOURCES } from '../lib/checkinResources'
import {
  useCheckinRows,
  useCheckinSetForResource,
  useIsResourceChecked,
  useToggleCheckinResource,
  type CheckinResourceHookOptions,
} from './useCheckinResource'

export type { CheckinSet } from './useCheckinResource'
export const CHECKINS_KEY = [CHECKIN_RESOURCES.relics.queryKey] as const

const relicCheckinOptions: CheckinResourceHookOptions<Checkin, number> = {
  queryKey: CHECKINS_KEY,
  idColumn: CHECKIN_RESOURCES.relics.idColumn,
  fetchRows: fetchCheckins,
  addRow: addCheckin,
  removeRow: removeCheckin,
  makeOptimisticRow: (userId, relicId) => ({
    user_id: userId,
    relic_id: relicId,
    checked_at: new Date().toISOString(),
  }),
}

export function useCheckins() {
  return useCheckinRows(relicCheckinOptions)
}

export function useCheckinSet() {
  return useCheckinSetForResource(relicCheckinOptions)
}

export function useIsChecked(userId: UserId | null, relicId: number) {
  return useIsResourceChecked(relicCheckinOptions, userId, relicId)
}

export function useToggleCheckin() {
  return useToggleCheckinResource(relicCheckinOptions)
}
