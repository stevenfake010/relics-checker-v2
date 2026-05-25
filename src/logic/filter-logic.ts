import type { Relic, Era, Cat } from '../data/types'
import { CITY_MAP } from '../data/meta'
import type { CheckinSet } from '../hooks/useCheckins'

export interface FilterState {
  era: Era | 'all'
  cat: Cat | 'all'
  checkedByA: boolean | null   // null = show all
  checkedByB: boolean | null
  search: string
  city: string | null          // 选中的城市筛选（按城市点选）
}

export const DEFAULT_FILTER: FilterState = {
  era: 'all',
  cat: 'all',
  checkedByA: null,
  checkedByB: null,
  search: '',
  city: null,
}

/**
 * 判断文物是否有"常设展出"
 */
export function hasPermanentExhibition(r: Relic): boolean {
  return !!r.exhibitions?.some((e) => e.year === '常设')
}

/**
 * 获取最近一次展出时间（数字年份）。如果只有常设返回 null。
 */
export function getLatestExhibitionYear(r: Relic): number | null {
  if (!r.exhibitions) return null
  const years = r.exhibitions
    .map((e) => (typeof e.year === 'number' ? e.year : null))
    .filter((y): y is number => y !== null)
  if (years.length === 0) return null
  return Math.max(...years)
}

/**
 * 是否纳入"常设可达打卡"统计：
 *   非书画 + 非 noPublicDisplay + 有常设
 */
export function isCountedForPermanent(r: Relic): boolean {
  if (r.cat === 'painting') return false
  if (r.noPublicDisplay) return false
  return hasPermanentExhibition(r)
}

export function filterRelics(
  relics: Relic[],
  filter: FilterState,
  checkinSet: CheckinSet
): Relic[] {
  return relics.filter((r) => {
    // Era filter
    if (filter.era !== 'all' && r.era !== filter.era) return false
    // Cat filter
    if (filter.cat !== 'all' && r.cat !== filter.cat) return false
    // City filter (按城市点选)
    if (filter.city) {
      if (getCity(r.location) !== filter.city) return false
    }
    // Search
    if (filter.search) {
      const q = filter.search.toLowerCase()
      const haystack = `${r.name} ${r.location} ${r.desc}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    // Checkin A filter
    if (filter.checkedByA !== null) {
      const checked = checkinSet.has(`zuo:${r.id}`)
      if (filter.checkedByA && !checked) return false
      if (!filter.checkedByA && checked) return false
    }
    // Checkin B filter
    if (filter.checkedByB !== null) {
      const checked = checkinSet.has(`huang:${r.id}`)
      if (filter.checkedByB && !checked) return false
      if (!filter.checkedByB && checked) return false
    }
    return true
  })
}

export function getCity(location: string): string {
  // location may be "A/B" style
  const primary = location.split('/')[0].trim()
  return CITY_MAP[primary] ?? primary
}

export function sortByCity(relics: Relic[]): Relic[] {
  return [...relics].sort((a, b) => {
    const ca = getCity(a.location)
    const cb = getCity(b.location)
    if (ca !== cb) return ca.localeCompare(cb, 'zh')
    return a.id - b.id
  })
}

/**
 * 按"常设非书画 → 常设书画 → 非常设"三段排序，每段内按 id 升序
 */
export function sortByPermanentPriority(relics: Relic[]): Relic[] {
  return [...relics].sort((a, b) => {
    const ga = bucketOf(a)
    const gb = bucketOf(b)
    if (ga !== gb) return ga - gb
    return a.id - b.id
  })
}

function bucketOf(r: Relic): number {
  const perm = hasPermanentExhibition(r)
  if (perm && r.cat !== 'painting') return 0  // 常设非书画
  if (perm && r.cat === 'painting') return 1  // 常设书画
  return 2                                     // 非常设
}

export interface CityRank {
  city: string
  /** 满足"常设+非书画+非noPublicDisplay"的总数 */
  total: number
  /** 已被任意一人打卡的数 */
  checkedAny: number
  /** 未被任何人打卡的数（即待打卡） */
  pending: number
}

/**
 * 按"非书画+非noPublicDisplay+有常设"未打卡数对城市排名
 */
export function rankCitiesByPending(
  relics: Relic[],
  checkinSetA: CheckinSet,
  userIdA: string,
  checkinSetB: CheckinSet | null = null,
  userIdB: string | null = null
): CityRank[] {
  const map = new Map<string, CityRank>()

  for (const r of relics) {
    if (!isCountedForPermanent(r)) continue
    const city = getCity(r.location)
    if (!map.has(city)) {
      map.set(city, { city, total: 0, checkedAny: 0, pending: 0 })
    }
    const rank = map.get(city)!
    rank.total += 1
    const checkedA = checkinSetA.has(`${userIdA}:${r.id}`)
    const checkedB = !!(checkinSetB && userIdB && checkinSetB.has(`${userIdB}:${r.id}`))
    if (checkedA || checkedB) {
      rank.checkedAny += 1
    } else {
      rank.pending += 1
    }
  }

  return [...map.values()]
    .filter((r) => r.pending > 0)         // 只显示还有待打卡的
    .sort((a, b) => b.pending - a.pending)
}

/**
 * 单人视角的城市排名 - 用于个人未打卡统计
 */
export function rankCitiesByMyPending(
  relics: Relic[],
  checkinSet: CheckinSet,
  userId: string
): CityRank[] {
  return rankCitiesByPending(relics, checkinSet, userId)
}
