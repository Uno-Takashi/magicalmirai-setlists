/**
 * 開催回。原則として 1 年に 1 回だが、10th Anniversary のように西暦と異なる名前を
 * 持つ回や、札幌公演のように開催が翌年にまたがる回があるため、
 * 「年」ではなく「開催回」を単位にしている。
 */

import type { LocalizedText } from '@/domain/vocaloid/Vocaloid'
import type { Performance } from './Performance'

export interface Edition {
  /** 開催回を代表する西暦。並び順に使う。 */
  readonly year: number
  /** URL に使う識別子。'2023' や '10th' など。 */
  readonly slug: string
  readonly name: LocalizedText
  /** その年の公式サイト。未設定なら UI はリンクを出さない。 */
  readonly officialUrl?: string
  /**
   * その回のテーマカラー (16 進)。キービジュアルなどから選んで dataset に書く。
   * 未指定なら UI は既定のサイト色を使う。単色でも複数でもよい。
   */
  readonly themeColors: readonly string[]
  readonly performances: readonly Performance[]
}

/** 開催回全体の開催日 (最初と最後)。年をまたぐ回にも対応する。 */
export function editionPeriod(edition: Edition): { from: string; to: string } | null {
  const dates = edition.performances.flatMap((p) => p.shows.map((s) => s.date)).sort()
  if (dates.length === 0) return null
  return { from: dates[0]!, to: dates[dates.length - 1]! }
}

export function findPerformance(edition: Edition, performanceId: string): Performance | undefined {
  return edition.performances.find((p) => p.id === performanceId)
}
