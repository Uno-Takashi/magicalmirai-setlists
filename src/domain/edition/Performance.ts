/** ある開催回のうち、1 つの公演地での公演。複数の Show(日程) を持つ。 */

import type { LocalizedText } from '@/domain/shared/LocalizedText'
import type { Region } from './Region'
import { SESSIONS, type Show } from './Show'

export interface Performance {
  readonly id: string
  readonly region: Region
  readonly city: LocalizedText
  /** 会場名。未確定なら undefined。 */
  readonly venue?: LocalizedText
  /**
   * 会場内で使った施設。公式サイトの表記をそのまま持つ
   * (例: 大ホール・展示イベントホール・コングレスセンター 2・3F)。
   * 公式サイトが会場名しか出していない年は undefined。
   */
  readonly halls?: LocalizedText
  /**
   * 地図を引くための検索語。会場名だけでは目的の場所に定まらないときに書く。
   * 省略時は会場名から引く (venueMapUrl を参照)。
   */
  readonly mapQuery?: string
  readonly shows: readonly Show[]
}

/** 同じ日の並び。昼→夜の順で、昼夜の区別が無い回は最後に置く。 */
function sessionOrder(show: Show): number {
  return show.session === undefined ? SESSIONS.length : SESSIONS.indexOf(show.session)
}

/** 同じ開催日の公演回をまとめる。日付の昇順、同じ日は昼→夜の順。 */
export function showsByDate(performance: Performance): { date: string; shows: Show[] }[] {
  const grouped = new Map<string, Show[]>()
  for (const show of performance.shows) {
    const list = grouped.get(show.date)
    if (list === undefined) grouped.set(show.date, [show])
    else list.push(show)
  }
  return [...grouped]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, shows]) => ({
      date,
      shows: shows.sort((a, b) => sessionOrder(a) - sessionOrder(b)),
    }))
}
