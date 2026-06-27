import {
  fetchGuobaoCheckins,
  addGuobaoCheckin,
  removeGuobaoCheckin,
  type GuobaoCheckin,
} from '../lib/guobaoQueries'
import { CHECKIN_RESOURCES } from '../lib/checkinResources'
import {
  useCheckinRows,
  useCheckinSetForResource,
  useToggleCheckinResource,
  type CheckinResourceHookOptions,
  type CheckinSet,
} from './useCheckinResource'

export const GUOBAO_CHECKINS_KEY = [CHECKIN_RESOURCES.guobao.queryKey] as const

export type GuobaoCheckinSet = CheckinSet

const guobaoCheckinOptions: CheckinResourceHookOptions<GuobaoCheckin, string> = {
  queryKey: GUOBAO_CHECKINS_KEY,
  idColumn: CHECKIN_RESOURCES.guobao.idColumn,
  fetchRows: fetchGuobaoCheckins,
  addRow: addGuobaoCheckin,
  removeRow: removeGuobaoCheckin,
  makeOptimisticRow: (userId, siteId) => ({
    user_id: userId,
    site_id: siteId,
    checked_at: new Date().toISOString(),
  }),
}

export function useGuobaoCheckins() {
  return useCheckinRows(guobaoCheckinOptions)
}

export function useGuobaoCheckinSet() {
  return useCheckinSetForResource(guobaoCheckinOptions)
}

export function useToggleGuobaoCheckin() {
  return useToggleCheckinResource(guobaoCheckinOptions)
}
