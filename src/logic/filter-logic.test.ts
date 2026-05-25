import { describe, it, expect } from 'vitest'
import {
  filterRelics, sortByCity, sortByPermanentPriority, rankCitiesByPending,
  hasPermanentExhibition, getLatestExhibitionYear, isCountedForPermanent,
  DEFAULT_FILTER,
} from './filter-logic'
import type { Relic } from '../data/types'

const makeRelic = (overrides: Partial<Relic> & { id: number }): Relic => ({
  name: `Relic ${overrides.id}`,
  era: 'qinhan',
  cat: 'bronze',
  location: '中国国家博物馆',
  desc: 'desc',
  ...overrides,
})

const r1 = makeRelic({
  id: 1, era: 'prehistoric', cat: 'ceramics', location: '故宫博物院',
  exhibitions: [{ year: '常设', venue: '故宫博物院', show: '常设展' }],
})
const r2 = makeRelic({
  id: 2, era: 'shangzhou', cat: 'bronze', location: '上海博物馆',
  exhibitions: [{ year: '常设', venue: '上海博物馆', show: '常设展' }],
})
const r3 = makeRelic({
  id: 3, era: 'qinhan', cat: 'painting', location: '湖北省博物馆', name: '越王勾践剑',
  exhibitions: [{ year: 2024, venue: '湖北省博物馆', show: '特展' }],
})
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
    const set = new Set(['zuo:1'])
    const res = filterRelics(relics, { ...DEFAULT_FILTER, checkedByA: true }, set)
    expect(res).toHaveLength(1)
    expect(res[0].id).toBe(1)
  })

  it('filters by checkedByA = false (only unchecked)', () => {
    const set = new Set(['zuo:1'])
    const res = filterRelics(relics, { ...DEFAULT_FILTER, checkedByA: false }, set)
    expect(res).toHaveLength(2)
    expect(res.every((r) => r.id !== 1)).toBe(true)
  })

  it('filters by city', () => {
    const res = filterRelics(relics, { ...DEFAULT_FILTER, city: '北京' }, new Set())
    // 故宫博物院 -> 北京
    expect(res.map((r) => r.id)).toEqual([1])
  })
})

describe('sortByCity', () => {
  it('preserves all relics', () => {
    expect(sortByCity(relics)).toHaveLength(3)
  })
})

describe('sortByPermanentPriority', () => {
  it('orders by 常设非书画 -> 常设书画 -> 非常设', () => {
    const r4 = makeRelic({
      id: 4, cat: 'painting',
      exhibitions: [{ year: '常设', venue: 'X', show: '常设展' }],
    })
    const r5 = makeRelic({ id: 5, exhibitions: [{ year: 2024, venue: 'X', show: '特展' }] })
    const arr = [r3, r4, r5, r1, r2]
    const sorted = sortByPermanentPriority(arr)
    // 常设非书画 (r1, r2) -> 常设书画 (r4) -> 非常设 (r3, r5)
    expect(sorted.map((r) => r.id)).toEqual([1, 2, 4, 3, 5])
  })
})

describe('hasPermanentExhibition', () => {
  it('detects 常设', () => {
    expect(hasPermanentExhibition(r1)).toBe(true)
    expect(hasPermanentExhibition(r3)).toBe(false)
  })
})

describe('getLatestExhibitionYear', () => {
  it('returns latest numeric year', () => {
    expect(getLatestExhibitionYear(r3)).toBe(2024)
  })
  it('returns null when only 常设', () => {
    expect(getLatestExhibitionYear(r1)).toBe(null)
  })
})

describe('isCountedForPermanent', () => {
  it('excludes painting', () => {
    expect(isCountedForPermanent(r3)).toBe(false)
  })
  it('excludes noPublicDisplay', () => {
    const r = makeRelic({ id: 99, noPublicDisplay: true })
    expect(isCountedForPermanent(r)).toBe(false)
  })
  it('requires permanent exhibition', () => {
    const r = makeRelic({ id: 100, exhibitions: [{ year: 2024, venue: 'X', show: 'S' }] })
    expect(isCountedForPermanent(r)).toBe(false)
  })
  it('includes regular non-painting with 常设', () => {
    expect(isCountedForPermanent(r1)).toBe(true)
    expect(isCountedForPermanent(r2)).toBe(true)
  })
})

describe('rankCitiesByPending', () => {
  it('only counts permanent + non-painting + non-noPublicDisplay', () => {
    // r1, r2 计入；r3 是 painting 不计入
    const ranks = rankCitiesByPending(relics, new Set(), 'zuo')
    const total = ranks.reduce((sum, r) => sum + r.total, 0)
    expect(total).toBe(2)
  })

  it('shows only cities with pending > 0', () => {
    // 都打卡过 -> 不在列表中
    const set = new Set(['zuo:1', 'zuo:2'])
    const ranks = rankCitiesByPending(relics, set, 'zuo')
    expect(ranks).toHaveLength(0)
  })

  it('sorts by pending desc', () => {
    const r4 = makeRelic({
      id: 4, location: '上海博物馆',
      exhibitions: [{ year: '常设', venue: '上海博物馆', show: '常设展' }],
    })
    const arr = [r1, r2, r4]
    const ranks = rankCitiesByPending(arr, new Set(), 'zuo')
    // 上海 2 件 > 北京 1 件
    expect(ranks[0].city).toBe('上海')
    expect(ranks[0].pending).toBe(2)
  })

  it('counts checkedAny when either user has checked', () => {
    const set = new Set(['huang:1'])
    const ranks = rankCitiesByPending([r1, r2], set, 'zuo', set, 'huang')
    // r1 already checked by huang -> not pending
    const beijing = ranks.find((r) => r.city === '北京')
    expect(beijing).toBeUndefined()
  })
})
