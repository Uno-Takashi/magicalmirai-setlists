/** ある開催回のうち、1 つの公演地での公演。複数の Show(日程) を持つ。 */

import type { LocalizedText } from '@/domain/vocaloid/Vocaloid'
import type { Region } from './Region'
import type { Show } from './Show'

export interface Performance {
  readonly id: string
  readonly region: Region
  readonly city: LocalizedText
  /** 会場名。未確定なら undefined。 */
  readonly venue?: LocalizedText
  readonly shows: readonly Show[]
}

/** 同じ開催日の公演回をまとめる。日付の昇順、同じ日は昼→夜の順。 */
export function showsByDate(performance: Performance): { date: string; shows: Show[] }[] {
  const grouped = new Map<string, Show[]>()
  for (const show of performance.shows) {
    const list = grouped.get(show.date) ?? []
    list.push(show)
    grouped.set(show.date, list)
  }
  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, shows]) => ({
      date,
      shows: [...shows].sort((a, b) => SESSION_ORDER(a) - SESSION_ORDER(b)),
    }))
}

const SESSION_ORDER = (show: Show): number =>
  show.session === 'matinee' ? 0 : show.session === 'evening' ? 1 : 2

/** その公演地の開催期間 (最初と最後の開催日)。 */
export function performancePeriod(performance: Performance): { from: string; to: string } | null {
  if (performance.shows.length === 0) return null
  const dates = performance.shows.map((show) => show.date).sort()
  return { from: dates[0]!, to: dates[dates.length - 1]! }
}
