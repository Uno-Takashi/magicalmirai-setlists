/**
 * 曲順の枠がどう入れ替わるかの分類。
 *
 * 候補に付いた「どの公演回で演奏されたか」(`TrackVariant.shows`) だけから計算する。
 * データに書いてある区分をそのまま読むのではなく、演奏実績から導く。
 */

import type { Session } from '@/domain/edition/Show'
import { performanceIdOf, showIdOf, type ShowRef, type Track, type TrackVariant } from './Track'

export const TRACK_VARIATIONS = [
  'fixed',
  'venue',
  'session',
  'schedule',
  'venue-and-schedule',
  'daily',
] as const

/**
 * - `fixed`              候補が 1 つだけの固定曲
 * - `venue`              会場替わり (会場ごとに違う)
 * - `session`            昼夜入れ替え (昼公演と夜公演で入れ替わるだけ)
 * - `schedule`           日程替わり (日で違う。会場では出し分けられていない)
 * - `venue-and-schedule` 会場替わりかつ日程替わり
 * - `daily`              上のどれでも言い表せない日替わり
 */
export type TrackVariation = (typeof TRACK_VARIATIONS)[number]

/** 候補の集合が「ある軸の値がそろえば全部含む」形になっているか。 */
function partitionedBy(
  variants: readonly TrackVariant[],
  scope: readonly string[],
  axis: (ref: string) => string,
): boolean {
  return variants.every((variant) => {
    const values = new Set(variant.shows.map(axis))
    const expected = scope.filter((ref) => values.has(axis(ref)))
    return expected.length === variant.shows.length
  })
}

/** 公演回の参照から昼/夜を引く。区別が無い回は undefined。 */
export type SessionOf = (ref: ShowRef) => Session | undefined

/**
 * 候補が昼公演と夜公演で丸ごと入れ替わっているか。
 *
 * 日程替わりの中でも「昼と夜で入れ替わるだけ」は日付を並べるより
 * 昼夜と言ったほうが伝わるので、先に切り出して別の軸として扱う。
 * 昼夜の区別が付かない公演回が混ざっていたら、この軸では言い表せない。
 */
function partitionedBySession(
  variants: readonly TrackVariant[],
  scope: readonly ShowRef[],
  sessionOf: SessionOf,
): boolean {
  const sessions = scope.map(sessionOf)
  if (sessions.some((session) => session === undefined)) return false
  if (new Set(sessions).size < 2) return false
  return partitionedBy(variants, scope, (ref) => sessionOf(ref) ?? '')
}

export function classifyVariation(track: Track, sessionOf?: SessionOf): TrackVariation {
  if (track.variants.length <= 1) return 'fixed'
  // 公演回が記録されていない年は、どの軸で入れ替わったかを言えない
  if (track.variants.some((variant) => variant.shows.length === 0)) return 'daily'

  const scope = track.variants.flatMap((variant) => [...variant.shows])
  const byVenue = partitionedBy(track.variants, scope, performanceIdOf)
  const bySchedule = partitionedBy(track.variants, scope, showIdOf)
  const bySession =
    sessionOf !== undefined && partitionedBySession(track.variants, scope, sessionOf)

  // 昼夜で分かれる枠は公演回の id でも必ず分かれるので、日程替わりより先に見る
  if (bySession && !byVenue) return 'session'
  if (byVenue && bySchedule) return 'venue-and-schedule'
  if (byVenue) return 'venue'
  if (bySchedule) return 'schedule'
  return 'daily'
}

/** 入れ替わりの軸。`venue-and-schedule` は 2 つの軸を同時に持つ。 */
export type VariationAxis = 'venue' | 'session' | 'schedule' | 'daily'

/** 分類を、画面に並べる軸の列に開く。固定曲は軸を持たない。 */
export function variationAxes(variation: TrackVariation): readonly VariationAxis[] {
  switch (variation) {
    case 'fixed':
      return []
    case 'venue-and-schedule':
      return ['venue', 'schedule']
    default:
      return [variation]
  }
}

/** 候補がどの範囲で演奏されたかを、画面で言い表すための記述。 */
export type VariantScope =
  | { readonly kind: 'venues'; readonly performanceIds: readonly string[] }
  | { readonly kind: 'shows'; readonly showIds: readonly string[] }
  | { readonly kind: 'mixed'; readonly shows: readonly string[] }

export function variantScope(track: Track, variant: TrackVariant): VariantScope | null {
  if (variant.shows.length === 0) return null

  const scope = track.variants.flatMap((v) => [...v.shows])
  const venues = [...new Set(variant.shows.map(performanceIdOf))]
  if (
    scope.filter((ref) => venues.includes(performanceIdOf(ref))).length === variant.shows.length
  ) {
    return { kind: 'venues', performanceIds: venues }
  }

  const showIds = [...new Set(variant.shows.map(showIdOf))]
  if (scope.filter((ref) => showIds.includes(showIdOf(ref))).length === variant.shows.length) {
    return { kind: 'shows', showIds }
  }

  return { kind: 'mixed', shows: variant.shows }
}
