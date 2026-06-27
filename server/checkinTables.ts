export type CheckinKind = 'relics' | 'heritage' | 'world' | 'guobao'

export interface CheckinTableConfig {
  table: string
  idColumn: 'relic_id' | 'site_id'
  idType: 'number' | 'string'
  select: string
  supportsPhoto: boolean
}

export const CHECKIN_TABLES: Record<CheckinKind, CheckinTableConfig> = {
  relics: {
    table: 'checkins',
    idColumn: 'relic_id',
    idType: 'number',
    select: 'user_id, relic_id, checked_at, photo_url',
    supportsPhoto: true,
  },
  heritage: {
    table: 'heritage_checkins',
    idColumn: 'site_id',
    idType: 'string',
    select: 'user_id, site_id, checked_at, photo_url',
    supportsPhoto: true,
  },
  world: {
    table: 'world_checkins',
    idColumn: 'site_id',
    idType: 'string',
    select: 'user_id, site_id, checked_at',
    supportsPhoto: false,
  },
  guobao: {
    table: 'guobao_checkins',
    idColumn: 'site_id',
    idType: 'string',
    select: 'user_id, site_id, checked_at, photo_url',
    supportsPhoto: true,
  },
}

export function getCheckinTable(kind: unknown): CheckinTableConfig | null {
  if (typeof kind !== 'string') return null
  return CHECKIN_TABLES[kind as CheckinKind] ?? null
}

export function normalizeItemId(config: CheckinTableConfig, value: unknown): string | number | null {
  if (config.idType === 'number') {
    const numberValue = typeof value === 'number' ? value : Number(value)
    if (!Number.isInteger(numberValue) || numberValue <= 0) return null
    return numberValue
  }

  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 && trimmed.length <= 64 ? trimmed : null
}

