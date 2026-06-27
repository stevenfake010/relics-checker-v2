import {
  fetchHeritageCheckins,
  addHeritageCheckin,
  removeHeritageCheckin,
  type HeritageCheckin,
} from '../lib/heritageQueries'
import type { UserId } from '../contexts/IdentityContext'
import { CHECKIN_RESOURCES } from '../lib/checkinResources'
import {
  useCheckinRows,
  useCheckinSetForResource,
  useIsResourceChecked,
  useToggleCheckinResource,
  type CheckinResourceHookOptions,
  type CheckinSet,
} from './useCheckinResource'

export const HERITAGE_CHECKINS_KEY = [CHECKIN_RESOURCES.heritage.queryKey] as const

export type HeritageCheckinSet = CheckinSet

const heritageCheckinOptions: CheckinResourceHookOptions<HeritageCheckin, string> = {
  queryKey: HERITAGE_CHECKINS_KEY,
  idColumn: CHECKIN_RESOURCES.heritage.idColumn,
  fetchRows: fetchHeritageCheckins,
  addRow: addHeritageCheckin,
  removeRow: removeHeritageCheckin,
  makeOptimisticRow: (userId, siteId) => ({
    user_id: userId,
    site_id: siteId,
    checked_at: new Date().toISOString(),
  }),
}

export function useHeritageCheckins() {
  return useCheckinRows(heritageCheckinOptions)
}

export function useHeritageCheckinSet() {
  return useCheckinSetForResource(heritageCheckinOptions)
}

export function useIsHeritageChecked(userId: UserId | null, siteId: string) {
  return useIsResourceChecked(heritageCheckinOptions, userId, siteId)
}

export function useToggleHeritageCheckin() {
  return useToggleCheckinResource(heritageCheckinOptions)
}
