/**
 * セットリストの 1 枠。
 *
 * 日替わり・会場別の枠があるため、枠は 1 曲に固定されず候補(variants)を持つ。
 * 候補が 1 つだけの枠が「固定曲」にあたる。
 */

import type { Song, SongTitle } from '@/domain/song/Song'
import type { VocaloidId } from '@/domain/vocaloid/Vocaloid'
import type { TrackTag } from './TrackTag'

/** 公演回への参照。`<公演 id>/<公演回 id>` の形。 */
export type ShowRef = string

export interface TrackVariant {
  readonly song: SongTitle
  /**
   * この候補が演奏された公演回。空なら「どの回かは記録されていない」。
   * 会場替わり / 日程替わり の判定はここから計算する。
   */
  readonly shows: readonly ShowRef[]
  /** 出典に書かれていた条件。shows を持たない年の表示に使う。 */
  readonly note?: string
  /** その公演だけ歌唱者が異なる場合の上書き。 */
  readonly singers?: readonly VocaloidId[]
}

export function performanceIdOf(ref: ShowRef): string {
  return ref.split('/')[0] ?? ''
}

export function showIdOf(ref: ShowRef): string {
  return ref.split('/')[1] ?? ''
}

/**
 * その公演で実際に歌ったボーカロイド。
 *
 * 楽曲マスタの singers は「原曲の歌唱者」で、同じ曲でも年によって歌うキャラが
 * 変わる。セットリスト側に上書きがあるときは必ずそちらを優先する。
 */
export function variantSingers(
  variant: TrackVariant,
  song: Song | undefined,
): readonly VocaloidId[] {
  return variant.singers ?? song?.singers ?? []
}

export interface Track {
  readonly order: number
  readonly variants: readonly TrackVariant[]
  readonly tags: readonly TrackTag[]
}

/** 候補が複数ある枠か。 */
export function isVariable(track: Track): boolean {
  return track.variants.length > 1
}

export function trackSongs(track: Track): readonly SongTitle[] {
  return track.variants.map((variant) => variant.song)
}
