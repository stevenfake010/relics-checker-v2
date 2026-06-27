import {
  fetchWorldCheckins,
  addWorldCheckin,
  removeWorldCheckin,
  type WorldCheckin,
} from '../lib/worldQueries'
import { CHECKIN_RESOURCES } from '../lib/checkinResources'
import {
  useCheckinRows,
  useCheckinSetForResource,
  useToggleCheckinResource,
  type CheckinResourceHookOptions,
  type CheckinSet,
} from './useCheckinResource'

export const WORLD_CHECKINS_KEY = [CHECKIN_RESOURCES.world.queryKey] as const

export type WorldCheckinSet = CheckinSet

const worldCheckinOptions: CheckinResourceHookOptions<WorldCheckin, string> = {
  queryKey: WORLD_CHECKINS_KEY,
  idColumn: CHECKIN_RESOURCES.world.idColumn,
  fetchRows: fetchWorldCheckins,
  addRow: addWorldCheckin,
  removeRow: removeWorldCheckin,
  makeOptimisticRow: (userId, siteId) => ({
    user_id: userId,
    site_id: siteId,
    checked_at: new Date().toISOString(),
  }),
}

export function useWorldCheckins() {
  return useCheckinRows(worldCheckinOptions)
}

export function useWorldCheckinSet() {
  return useCheckinSetForResource(worldCheckinOptions)
}

export function useToggleWorldCheckin() {
  return useToggleCheckinResource(worldCheckinOptions)
}
