/**
 * 1 つ以上の公演に適用されるセットリスト。
 *
 * 10th の札幌公演のように公演地ごとに曲目が大きく違う場合があるため、
 * 開催回は複数のセットリストを持ちうる。
 */

import type { SongTitle } from '@/domain/song/Song'
import type { Track } from './Track'
import { isPerformed, type TrackTag } from './TrackTag'

export interface Setlist {
  /** 適用先の Performance.id。 */
  readonly performanceIds: readonly string[]
  readonly tracks: readonly Track[]
}

/** 指定タグを持つ最初の曲名を返す。テーマソングや楽曲グランプリの取得に使う。 */
export function findTaggedSong(setlist: Setlist, tag: TrackTag): SongTitle | undefined {
  const track = setlist.tracks.find((t) => t.tags.includes(tag))
  return track?.variants[0]?.song
}

/** 実際に演奏された枠だけを返す。 */
export function performedTracks(setlist: Setlist): readonly Track[] {
  return setlist.tracks.filter((track) => isPerformed(track.tags))
}

export function bonusTracks(setlist: Setlist): readonly Track[] {
  return setlist.tracks.filter((track) => !isPerformed(track.tags))
}
