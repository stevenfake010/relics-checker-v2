import { describe, expect, it } from 'vitest'
import { getCheckinTable } from '../../api/_lib/checkinTables.js'

describe('getCheckinTable', () => {
  it.each([
    ['relics', 'checkins'],
    ['heritage', 'heritage_checkins'],
    ['world', 'world_checkins'],
    ['guobao', 'guobao_checkins'],
  ])('maps frontend alias %s to %s', (alias, table) => {
    expect(getCheckinTable(alias)?.table).toBe(table)
  })

  it.each(['checkins', 'heritage_checkins', 'world_checkins', 'guobao_checkins'])(
    'accepts database table name %s',
    (table) => {
      expect(getCheckinTable(table)?.table).toBe(table)
    }
  )
})
