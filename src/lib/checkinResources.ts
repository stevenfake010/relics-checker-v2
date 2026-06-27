export type CheckinResource = 'relics' | 'heritage' | 'world' | 'guobao'
export type CheckinTableName = 'checkins' | 'heritage_checkins' | 'world_checkins' | 'guobao_checkins'
export type CheckinIdColumn = 'relic_id' | 'site_id'
export type CheckinItemIdType = 'number' | 'string'

export interface CheckinResourceConfig {
  resource: CheckinResource
  table: CheckinTableName
  queryKey: CheckinTableName
  idColumn: CheckinIdColumn
  select: string
  supportsPhoto: boolean
  itemIdType: CheckinItemIdType
}

export const CHECKIN_RESOURCES = {
  relics: {
    resource: 'relics',
    table: 'checkins',
    queryKey: 'checkins',
    idColumn: 'relic_id',
    select: 'user_id,relic_id,checked_at,photo_url',
    supportsPhoto: true,
    itemIdType: 'number',
  },
  heritage: {
    resource: 'heritage',
    table: 'heritage_checkins',
    queryKey: 'heritage_checkins',
    idColumn: 'site_id',
    select: 'user_id,site_id,checked_at,photo_url',
    supportsPhoto: true,
    itemIdType: 'string',
  },
  world: {
    resource: 'world',
    table: 'world_checkins',
    queryKey: 'world_checkins',
    idColumn: 'site_id',
    select: 'user_id,site_id,checked_at',
    supportsPhoto: false,
    itemIdType: 'string',
  },
  guobao: {
    resource: 'guobao',
    table: 'guobao_checkins',
    queryKey: 'guobao_checkins',
    idColumn: 'site_id',
    select: 'user_id,site_id,checked_at,photo_url',
    supportsPhoto: true,
    itemIdType: 'string',
  },
} as const satisfies Record<CheckinResource, CheckinResourceConfig>

const CHECKIN_TABLE_ALIASES: Record<string, CheckinResource> = {
  relics: 'relics',
  checkins: 'relics',
  heritage: 'heritage',
  heritage_checkins: 'heritage',
  world: 'world',
  world_checkins: 'world',
  guobao: 'guobao',
  guobao_checkins: 'guobao',
}

export function getCheckinResourceConfig(value: unknown): CheckinResourceConfig | null {
  if (typeof value !== 'string') return null
  const resource = CHECKIN_TABLE_ALIASES[value]
  return resource ? CHECKIN_RESOURCES[resource] : null
}

export function normalizeCheckinItemId(
  config: CheckinResourceConfig,
  value: unknown
): number | string | null {
  if (config.itemIdType === 'number') {
    const numericValue = typeof value === 'number' ? value : Number(value)
    return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : null
  }

  if (typeof value !== 'string' && typeof value !== 'number') return null
  const stringValue = String(value)
  if (stringValue.length === 0 || stringValue.length > 128) return null
  return stringValue
}
