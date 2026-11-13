/**
 * 1 つ以上の公演に適用されるセットリスト。
 *
 * 10th の札幌公演のように公演地ごとに曲目が大きく違う場合があるため、
 * 開催回は複数のセットリストを持ちうる。
 */

import type { Track } from './Track'
import { isPerformed } from './TrackTag'

export interface Setlist {
  /** 適用先の Performance.id。 */
  readonly performanceIds: readonly string[]
  readonly tracks: readonly Track[]
}

/** 実際に演奏された枠だけを返す。 */
export function performedTracks(setlist: Setlist): readonly Track[] {
  return setlist.tracks.filter((track) => isPerformed(track.tags))
}

/** 円盤にだけ収録された枠を返す。公演では演奏されていない。 */
export function bonusTracks(setlist: Setlist): readonly Track[] {
  return setlist.tracks.filter((track) => !isPerformed(track.tags))
}
