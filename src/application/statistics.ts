/**
 * カタログから統計を組み立てるユースケース。
 *
 * 「延べ」は (開催回, 曲) の組を 1 と数える。同じ開催回のなかで日替わり枠に
 * 同じ曲が複数回現れても 1 回として扱う。
 */

import type { Catalog } from '@/domain/catalog/Catalog'
import type { Edition } from '@/domain/edition/Edition'
import { performedTracks } from '@/domain/setlist/Setlist'
import { variantSingers } from '@/domain/setlist/Track'
import type { Song, SongTitle } from '@/domain/song/Song'
import type { Vocaloid, VocaloidId } from '@/domain/vocaloid/Vocaloid'

/** 開催回ごとに、その回で演奏された曲名の集合を返す。 */
function performedSongsByEdition(catalog: Catalog): { edition: Edition; songs: Set<SongTitle> }[] {
  return catalog.entries.map(({ edition, setlists }) => {
    const songs = new Set<SongTitle>()
    for (const setlist of setlists) {
      for (const track of performedTracks(setlist)) {
        for (const variant of track.variants) songs.add(variant.song)
      }
    }
    return { edition, songs }
  })
}

export interface OverallStats {
  /** セットリストを収集できている開催回の数。 */
  readonly editionCount: number
  /** 累計の演奏回数。(開催回, 曲) の組を 1 と数えた合計。 */
  readonly performanceCount: number
  /** 一度でも採用されたボカロ P の数。 */
  readonly producerCount: number
}

export function overallStats(catalog: Catalog): OverallStats {
  const byEdition = performedSongsByEdition(catalog).filter(({ songs }) => songs.size > 0)
  const producers = new Set<string>()
  let performanceCount = 0

  for (const { songs: editionSongs } of byEdition) {
    performanceCount += editionSongs.size
    for (const title of editionSongs) {
      for (const producer of catalog.songs.get(title)?.producers ?? []) producers.add(producer)
    }
  }

  return {
    editionCount: byEdition.length,
    performanceCount,
    producerCount: producers.size,
  }
}

export interface ProducerStat {
  readonly producer: string
  /** 採用された曲の数 (重複なし)。 */
  readonly songCount: number
  /** 延べ演奏回数。 */
  readonly appearanceCount: number
}

/**
 * ボカロ P ごとの採用楽曲数。曲数が多い順、同数なら延べ回数が多い順。
 * 合作は参加した各人にそれぞれ 1 曲として数える。
 */
export function producerRanking(catalog: Catalog): ProducerStat[] {
  const songs = new Map<string, Set<SongTitle>>()
  const appearances = new Map<string, number>()

  for (const { songs: editionSongs } of performedSongsByEdition(catalog)) {
    for (const title of editionSongs) {
      for (const producer of catalog.songs.get(title)?.producers ?? []) {
        const set = songs.get(producer) ?? new Set<SongTitle>()
        set.add(title)
        songs.set(producer, set)
        appearances.set(producer, (appearances.get(producer) ?? 0) + 1)
      }
    }
  }

  return [...songs.entries()]
    .map(([producer, set]) => ({
      producer,
      songCount: set.size,
      appearanceCount: appearances.get(producer) ?? 0,
    }))
    .sort(
      (a, b) =>
        b.songCount - a.songCount ||
        b.appearanceCount - a.appearanceCount ||
        a.producer.localeCompare(b.producer),
    )
}

export interface SongStat {
  readonly song: Song
  /** 演奏された開催回の数。 */
  readonly editionCount: number
}

/** 多くの開催回で演奏された曲のランキング。 */
export function songRanking(catalog: Catalog): SongStat[] {
  const counts = new Map<SongTitle, number>()
  for (const { songs } of performedSongsByEdition(catalog)) {
    for (const title of songs) counts.set(title, (counts.get(title) ?? 0) + 1)
  }

  const stats: SongStat[] = []
  for (const [title, editionCount] of counts) {
    const song = catalog.songs.get(title)
    if (song !== undefined) stats.push({ song, editionCount })
  }
  return stats.sort(
    (a, b) => b.editionCount - a.editionCount || a.song.title.localeCompare(b.song.title),
  )
}

export interface VocaloidStat {
  readonly vocaloid: Vocaloid
  /** 歌唱が記録されている曲の数 (重複なし)。 */
  readonly songCount: number
}

/**
 * 開催回ごとに、ボーカロイド別の「歌った曲名の集合」を返す。年代順 (昇順)。
 *
 * 歌唱者は「その公演で誰が歌ったか」がセットリスト側に入っている。
 * 楽曲マスタの singers は原曲の歌唱者で記録が少ないので、フォールバックとしてだけ使う。
 *
 * 1 曲を複数人で歌うことがあるので、1 つの曲が複数のボーカロイドに数えられる。
 * 同じ回のなかで日替わり候補として同じ曲が何度出てきても、集合なので 1 曲に潰れる。
 */
function songsByVocaloidPerEdition(
  catalog: Catalog,
  onlySolo = false,
): { edition: Edition; songs: Map<VocaloidId, Set<SongTitle>> }[] {
  return catalog.entries.map(({ edition, setlists }) => {
    const songs = new Map<VocaloidId, Set<SongTitle>>()
    for (const setlist of setlists) {
      for (const track of performedTracks(setlist)) {
        for (const variant of track.variants) {
          const singers = variantSingers(variant, catalog.songs.get(variant.song))
          if (onlySolo && singers.length !== 1) continue
          for (const id of singers) {
            const set = songs.get(id) ?? new Set<SongTitle>()
            set.add(variant.song)
            songs.set(id, set)
          }
        }
      }
    }
    return { edition, songs }
  })
}

/** ボーカロイドごとの曲数を、多い順に並べる。 */
function toRanking(catalog: Catalog, songs: Map<VocaloidId, Set<SongTitle>>): VocaloidStat[] {
  const stats: VocaloidStat[] = []
  for (const vocaloid of catalog.vocaloids.values()) {
    stats.push({ vocaloid, songCount: songs.get(vocaloid.id)?.size ?? 0 })
  }
  return stats.sort((a, b) => b.songCount - a.songCount)
}

/** 全開催回を通した、ボーカロイドごとの曲数 (重複を除いた曲名の数)。 */
export function vocaloidRanking(catalog: Catalog): VocaloidStat[] {
  return toRanking(catalog, unionByVocaloid(songsByVocaloidPerEdition(catalog)))
}

/**
 * そのボーカロイド 1 人だけで歌った曲の数。
 * デュエットやユニゾンの曲は誰にも数えない。
 */
export function vocaloidSoloRanking(catalog: Catalog): VocaloidStat[] {
  return toRanking(catalog, unionByVocaloid(songsByVocaloidPerEdition(catalog, true)))
}

function unionByVocaloid(
  byEdition: readonly { songs: Map<VocaloidId, Set<SongTitle>> }[],
): Map<VocaloidId, Set<SongTitle>> {
  const union = new Map<VocaloidId, Set<SongTitle>>()
  for (const { songs } of byEdition) {
    for (const [id, titles] of songs) {
      const set = union.get(id) ?? new Set<SongTitle>()
      for (const title of titles) set.add(title)
      union.set(id, set)
    }
  }
  return union
}

export interface VocaloidTrendPoint {
  readonly edition: Edition
  /** その回で歌った曲数。 */
  readonly perEdition: ReadonlyMap<VocaloidId, number>
  /**
   * その回までに歌った曲数。**同じ曲を別の回でまた歌っても 1 曲と数える**ので、
   * 各年の値の足し算にはならない。最後の点は vocaloidRanking と一致する。
   */
  readonly cumulative: ReadonlyMap<VocaloidId, number>
}

/**
 * 開催回ごとのボーカロイド別曲数の推移。年代順 (昇順)。
 * onlySolo を立てると、1 人だけで歌った曲に絞る。
 */
export function vocaloidTrend(catalog: Catalog, onlySolo = false): VocaloidTrendPoint[] {
  const byEdition = songsByVocaloidPerEdition(catalog, onlySolo).filter(
    ({ songs }) => songs.size > 0,
  )
  const seen = new Map<VocaloidId, Set<SongTitle>>()

  return byEdition.map(({ edition, songs }) => {
    const perEdition = new Map<VocaloidId, number>()
    const cumulative = new Map<VocaloidId, number>()
    for (const [id, titles] of songs) perEdition.set(id, titles.size)
    for (const [id, titles] of songs) {
      const set = seen.get(id) ?? new Set<SongTitle>()
      for (const title of titles) set.add(title)
      seen.set(id, set)
    }
    // 今回歌っていないボーカロイドも、累計は前回の値を保つ
    for (const [id, titles] of seen) cumulative.set(id, titles.size)
    return { edition, perEdition, cumulative }
  })
}
