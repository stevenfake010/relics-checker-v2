import {
  getCheckinResourceConfig,
  normalizeCheckinItemId,
  type CheckinResourceConfig,
} from '../../src/lib/checkinResources.js'
import type { UserId } from './auth.js'

export type CheckinTableConfig = CheckinResourceConfig

export function getCheckinTable(value: unknown): CheckinTableConfig | null {
  return getCheckinResourceConfig(value)
}

export function normalizeItemId(config: CheckinTableConfig, value: unknown): number | string | null {
  return normalizeCheckinItemId(config, value)
}

export function assertKnownUserId(userId: string): userId is UserId {
  return userId === 'zuo' || userId === 'huang'
}
