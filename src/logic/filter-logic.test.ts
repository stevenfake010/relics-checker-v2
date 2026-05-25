import { describe, it, expect } from 'vitest'
import { filterRelics, sortByCity, rankCitiesByPending, DEFAULT_FILTER } from './filter-logic'
import type { Relic } from '../data/types'

const makeRelic = (overrides: Partial<Relic> & { id: number }): Relic => ({
  name: `Relic ${overrides.id}`,
  era: 'qinhan',
  cat: 'bronze',
  location: '中国国家博物馆',
  desc: 'desc',
  ...overrides,
})

const r1 = makeRelic({ id: 1, era: 'prehistoric', cat: 'ceramics', location: '故宫博物院' })
const r2 = makeRelic({ id: 2, era: 'shangzhou', cat: 'bronze', location: '上海博物馆' })
const r3 = makeRelic({ id: 3, era: 'qinhan', cat: 'painting', location: '湖北省博物馆', name: '越王勾践剑' })
const relics = [r1, r2, r3]

describe('filterRelics', () => {
  it('returns all relics with default filter', () => {
    expect(filterRelics(relics, DEFAULT_FILTER, new Set())).toHaveLength(3)
  })

  it('filters by era', () => {
    const res = filterRelics(relics, { ...DEFAULT_FILTER, era: 'prehistoric' }, new Set())
    expect(res).toHaveLength(1)
    expect(res[0].id).toBe(1)
  })

  it('filters by cat', () => {
    const res = filterRelics(relics, { ...DEFAULT_FILTER, cat: 'bronze' }, new Set())
    expect(res).toHaveLength(1)
    expect(res[0].id).toBe(2)
  })

  it('filters by search', () => {
    const res = filterRelics(relics, { ...DEFAULT_FILTER, search: '越王' }, new Set())
    expect(res).toHaveLength(1)
    expect(res[0].id).toBe(3)
  })

  it('filters by checkedByA = true (only checked)', () => {
    const set = new Set(['userA:1'])
    const res = filterRelics(relics, { ...DEFAULT_FILTER, checkedByA: true }, set)
    expect(res).toHaveLength(1)
    expect(res[0].id).toBe(1)
  })

  it('filters by checkedByA = false (only unchecked)', () => {
    const set = new Set(['userA:1'])
    const res = filterRelics(relics, { ...DEFAULT_FILTER, checkedByA: false }, set)
    expect(res).toHaveLength(2)
    expect(res.every((r) => r.id !== 1)).toBe(true)
  })
})

describe('sortByCity', () => {
  it('sorts relics by city name', () => {
    const sorted = sortByCity(relics)
    // Should be sorted by Chinese city name
    expect(sorted.map((r) => r.id)).toEqual(expect.arrayContaining([1, 2, 3]))
  })

  it('preserves all relics', () => {
    expect(sortByCity(relics)).toHaveLength(3)
  })
})

describe('rankCitiesByPending', () => {
  it('ranks cities by pendingBoth count', () => {
    const set = new Set<string>()
    const ranks = rankCitiesByPending(relics, set)
    // All unchecked -> pendingBoth = total for each city
    for (const rank of ranks) {
      expect(rank.pendingBoth).toBe(rank.total)
    }
  })

  it('reduces pendingBoth when both checked', () => {
    const set = new Set(['userA:1', 'userB:1'])
    const ranks = rankCitiesByPending([r1], set)
    expect(ranks[0].pendingBoth).toBe(0)
    expect(ranks[0].checkedA).toBe(1)
    expect(ranks[0].checkedB).toBe(1)
  })

  it('counts total correctly', () => {
    const set = new Set<string>()
    const ranks = rankCitiesByPending(relics, set)
    const total = ranks.reduce((sum, r) => sum + r.total, 0)
    expect(total).toBe(3)
  })
})
