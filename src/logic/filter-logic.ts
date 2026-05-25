import type { Relic, Era, Cat } from '../data/types'
import { CITY_MAP } from '../data/meta'
import type { CheckinSet } from '../hooks/useCheckins'

export interface FilterState {
  era: Era | 'all'
  cat: Cat | 'all'
  checkedByA: boolean | null   // null = show all
  checkedByB: boolean | null
  search: string
}

export const DEFAULT_FILTER: FilterState = {
  era: 'all',
  cat: 'all',
  checkedByA: null,
  checkedByB: null,
  search: '',
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
    // Search
    if (filter.search) {
      const q = filter.search.toLowerCase()
      const haystack = `${r.name} ${r.location} ${r.desc}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    // Checkin A filter
    if (filter.checkedByA !== null) {
      const checked = checkinSet.has(`userA:${r.id}`)
      if (filter.checkedByA && !checked) return false
      if (!filter.checkedByA && checked) return false
    }
    // Checkin B filter
    if (filter.checkedByB !== null) {
      const checked = checkinSet.has(`userB:${r.id}`)
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

export interface CityRank {
  city: string
  total: number
  checkedA: number
  checkedB: number
  pendingA: number
  pendingB: number
  pendingBoth: number
}

export function rankCitiesByPending(
  relics: Relic[],
  checkinSet: CheckinSet
): CityRank[] {
  const map = new Map<string, CityRank>()

  for (const r of relics) {
    const city = getCity(r.location)
    if (!map.has(city)) {
      map.set(city, { city, total: 0, checkedA: 0, checkedB: 0, pendingA: 0, pendingB: 0, pendingBoth: 0 })
    }
    const rank = map.get(city)!
    rank.total += 1
    const ca = checkinSet.has(`userA:${r.id}`)
    const cb = checkinSet.has(`userB:${r.id}`)
    if (ca) rank.checkedA += 1
    if (cb) rank.checkedB += 1
    if (!ca) rank.pendingA += 1
    if (!cb) rank.pendingB += 1
    if (!ca && !cb) rank.pendingBoth += 1
  }

  return [...map.values()].sort((a, b) => b.pendingBoth - a.pendingBoth)
}
