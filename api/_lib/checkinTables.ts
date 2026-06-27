import type { UserId } from './auth.js'

export type CheckinTableConfig = {
  table: string
  idColumn: string
  select: string
  supportsPhoto: boolean
  itemIdType: 'number' | 'string'
}

const TABLES = {
  checkins: {
    table: 'checkins',
    idColumn: 'relic_id',
    select: 'user_id,relic_id,checked_at,photo_url',
    supportsPhoto: true,
    itemIdType: 'number',
  },
  heritage_checkins: {
    table: 'heritage_checkins',
    idColumn: 'site_id',
    select: 'user_id,site_id,checked_at,photo_url',
    supportsPhoto: true,
    itemIdType: 'number',
  },
  world_checkins: {
    table: 'world_checkins',
    idColumn: 'site_id',
    select: 'user_id,site_id,checked_at',
    supportsPhoto: false,
    itemIdType: 'string',
  },
  guobao_checkins: {
    table: 'guobao_checkins',
    idColumn: 'site_id',
    select: 'user_id,site_id,checked_at,photo_url',
    supportsPhoto: true,
    itemIdType: 'string',
  },
} as const satisfies Record<string, CheckinTableConfig>

export type CheckinTableName = keyof typeof TABLES

export function getCheckinTable(value: unknown): CheckinTableConfig | null {
  if (typeof value !== 'string') return null
  return TABLES[value as CheckinTableName] ?? null
}

export function normalizeItemId(config: CheckinTableConfig, value: unknown): number | string | null {
  if (config.itemIdType === 'number') {
    const numericValue = typeof value === 'number' ? value : Number(value)
    return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : null
  }

  if (typeof value !== 'string' || value.length === 0 || value.length > 128) {
    return null
  }

  return value
}

export function assertKnownUserId(userId: string): userId is UserId {
  return userId === 'zuo' || userId === 'huang'
}
