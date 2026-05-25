import { describe, it, expect } from 'vitest'
import { dualCompare, byEra, byCat, byMuseum } from './aggregate'
import type { Relic } from '../data/types'

const makeRelic = (overrides: Partial<Relic> & { id: number }): Relic => ({
  name: `Relic ${overrides.id}`,
  era: 'qinhan',
  cat: 'bronze',
  location: '故宫博物院',
  desc: 'test',
  ...overrides,
})

const r1 = makeRelic({ id: 1, era: 'prehistoric', cat: 'ceramics' })
const r2 = makeRelic({ id: 2, era: 'shangzhou', cat: 'bronze' })
const r3 = makeRelic({ id: 3, era: 'prehistoric', cat: 'painting', location: '上海博物馆' })
const relics = [r1, r2, r3]

describe('dualCompare', () => {
  it('returns all zeros for empty checkinSet', () => {
    const result = dualCompare(relics, new Set())
    expect(result.total).toBe(3)
    expect(result.checkedA).toBe(0)
    expect(result.checkedB).toBe(0)
    expect(result.checkedBoth).toBe(0)
    expect(result.neitherChecked).toBe(3)
  })

  it('counts correctly with partial checkins', () => {
    const set = new Set(['zuo:1', 'zuo:2', 'huang:2'])
    const result = dualCompare(relics, set)
    expect(result.checkedA).toBe(2)
    expect(result.checkedB).toBe(1)
    expect(result.checkedBoth).toBe(1)
    expect(result.onlyA).toBe(1)
    expect(result.onlyB).toBe(0)
    expect(result.neitherChecked).toBe(1)
  })

  it('handles all checked', () => {
    const set = new Set(['zuo:1', 'huang:1', 'zuo:2', 'huang:2', 'zuo:3', 'huang:3'])
    const result = dualCompare(relics, set)
    expect(result.checkedBoth).toBe(3)
    expect(result.neitherChecked).toBe(0)
    expect(result.checkedEither).toBe(3)
  })
})

describe('byEra', () => {
  it('groups by era correctly', () => {
    const result = byEra(relics, new Set())
    const prehistoric = result.find((e) => e.era === 'prehistoric')
    const shangzhou = result.find((e) => e.era === 'shangzhou')
    expect(prehistoric?.total).toBe(2)
    expect(shangzhou?.total).toBe(1)
  })

  it('counts checkins by era', () => {
    const set = new Set(['zuo:1'])
    const result = byEra(relics, set)
    const prehistoric = result.find((e) => e.era === 'prehistoric')
    expect(prehistoric?.checkedA).toBe(1)
    expect(prehistoric?.checkedB).toBe(0)
  })
})

describe('byCat', () => {
  it('groups by cat correctly', () => {
    const result = byCat(relics, new Set())
    const ceramics = result.find((c) => c.cat === 'ceramics')
    expect(ceramics?.total).toBe(1)
  })

  it('sorts by total descending', () => {
    const result = byCat(relics, new Set())
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].total).toBeGreaterThanOrEqual(result[i].total)
    }
  })
})

describe('byMuseum', () => {
  it('groups by museum correctly', () => {
    const result = byMuseum(relics, new Set())
    const palace = result.find((m) => m.museum === '故宫博物院')
    expect(palace?.total).toBe(2)
  })

  it('calculates percentages', () => {
    const set = new Set(['zuo:1', 'zuo:2'])
    const result = byMuseum(relics, set)
    const palace = result.find((m) => m.museum === '故宫博物院')
    expect(palace?.pctA).toBe(100)
  })
})
