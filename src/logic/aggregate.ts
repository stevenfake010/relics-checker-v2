import type { Relic, Era, Cat } from '../data/types'
import { CITY_MAP } from '../data/meta'
import type { CheckinSet } from '../hooks/useCheckins'

export interface DualCompareResult {
  total: number
  checkedA: number
  checkedB: number
  checkedBoth: number  // both A and B checked
  checkedEither: number  // at least one checked
  onlyA: number
  onlyB: number
  neitherChecked: number
}

export function dualCompare(relics: Relic[], checkinSet: CheckinSet): DualCompareResult {
  let checkedA = 0, checkedB = 0, checkedBoth = 0, onlyA = 0, onlyB = 0, neitherChecked = 0

  for (const r of relics) {
    const ca = checkinSet.has(`userA:${r.id}`)
    const cb = checkinSet.has(`userB:${r.id}`)
    if (ca) checkedA++
    if (cb) checkedB++
    if (ca && cb) checkedBoth++
    else if (ca && !cb) onlyA++
    else if (!ca && cb) onlyB++
    else neitherChecked++
  }

  return {
    total: relics.length,
    checkedA,
    checkedB,
    checkedBoth,
    checkedEither: checkedBoth + onlyA + onlyB,
    onlyA,
    onlyB,
    neitherChecked,
  }
}

export interface EraStats {
  era: Era
  total: number
  checkedA: number
  checkedB: number
}

export function byEra(relics: Relic[], checkinSet: CheckinSet): EraStats[] {
  const map = new Map<Era, EraStats>()

  for (const r of relics) {
    if (!map.has(r.era)) {
      map.set(r.era, { era: r.era, total: 0, checkedA: 0, checkedB: 0 })
    }
    const s = map.get(r.era)!
    s.total++
    if (checkinSet.has(`userA:${r.id}`)) s.checkedA++
    if (checkinSet.has(`userB:${r.id}`)) s.checkedB++
  }

  return [...map.values()]
}

export interface CatStats {
  cat: Cat
  total: number
  checkedA: number
  checkedB: number
}

export function byCat(relics: Relic[], checkinSet: CheckinSet): CatStats[] {
  const map = new Map<Cat, CatStats>()

  for (const r of relics) {
    if (!map.has(r.cat)) {
      map.set(r.cat, { cat: r.cat, total: 0, checkedA: 0, checkedB: 0 })
    }
    const s = map.get(r.cat)!
    s.total++
    if (checkinSet.has(`userA:${r.id}`)) s.checkedA++
    if (checkinSet.has(`userB:${r.id}`)) s.checkedB++
  }

  return [...map.values()].sort((a, b) => b.total - a.total)
}

export interface MuseumStats {
  museum: string
  city: string
  total: number
  checkedA: number
  checkedB: number
  pctA: number
  pctB: number
}

function primaryMuseum(location: string): string {
  return location.split('/')[0].trim()
}

export function byMuseum(relics: Relic[], checkinSet: CheckinSet): MuseumStats[] {
  const map = new Map<string, MuseumStats>()

  for (const r of relics) {
    const museum = primaryMuseum(r.location)
    const city = CITY_MAP[museum] ?? museum
    if (!map.has(museum)) {
      map.set(museum, { museum, city, total: 0, checkedA: 0, checkedB: 0, pctA: 0, pctB: 0 })
    }
    const s = map.get(museum)!
    s.total++
    if (checkinSet.has(`userA:${r.id}`)) s.checkedA++
    if (checkinSet.has(`userB:${r.id}`)) s.checkedB++
  }

  // Calculate percentages
  for (const s of map.values()) {
    s.pctA = s.total > 0 ? Math.round((s.checkedA / s.total) * 100) : 0
    s.pctB = s.total > 0 ? Math.round((s.checkedB / s.total) * 100) : 0
  }

  return [...map.values()].sort((a, b) => b.total - a.total)
}
