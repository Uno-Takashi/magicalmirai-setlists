/**
 * 曲名の逐次検索。1 文字入力するたびに呼ばれるため、検索インデックスは
 * カタログから一度だけ組み立てて使い回す。
 */

import type { Catalog } from '@/domain/catalog/Catalog'
import type { Edition } from '@/domain/edition/Edition'
import { variantSingers } from '@/domain/setlist/Track'
import { songSearchIndex, type Song, type SongTitle } from '@/domain/song/Song'
import type { VocaloidId } from '@/domain/vocaloid/Vocaloid'

export interface SongSearchHit {
  readonly song: Song
  /** その曲が登場した開催回 (年の昇順)。 */
  readonly editions: readonly Edition[]
}

interface IndexedSong {
  readonly song: Song
  readonly haystack: string
  readonly editions: readonly Edition[]
  /**
   * その曲を歌ったボーカロイドの和集合 (全開催回をまたぐ)。
   * 並びは dataset/vocaloids.yaml の順 (ミク → リン → レン → ルカ → MEIKO → KAITO)。
   */
  readonly singers: readonly VocaloidId[]
}

export interface SongSearchIndex {
  readonly items: readonly IndexedSong[]
  /** 曲名から引くための索引。1 曲ずつの照会が描画のたびに何度も走るため。 */
  readonly byTitle: ReadonlyMap<SongTitle, IndexedSong>
}

/**
 * その曲を歌ったボーカロイドの和集合。
 * 年によって歌唱者が変わるので、1 つの公演の記録だけでは足りない。
 */
export function singersOfSong(index: SongSearchIndex, title: SongTitle): readonly VocaloidId[] {
  return index.byTitle.get(title)?.singers ?? []
}

/**
 * その曲が演奏された開催回 (年の昇順)。
 * 検索用に組み立て済みのインデックスを引くだけなので、呼ぶたびに集計し直さない。
 */
export function editionsOfSong(index: SongSearchIndex, title: SongTitle): readonly Edition[] {
  return index.byTitle.get(title)?.editions ?? []
}

/** カタログから検索インデックスを構築する。 */
export function buildSongSearchIndex(catalog: Catalog): SongSearchIndex {
  const editions = new Map<SongTitle, Edition[]>()
  const singers = new Map<SongTitle, Set<VocaloidId>>()

  for (const { edition, setlists } of catalog.entries) {
    for (const setlist of setlists) {
      for (const track of setlist.tracks) {
        for (const variant of track.variants) {
          const song = catalog.songs.get(variant.song)
          if (song === undefined) continue

          // 歌唱者は年ごとに変わるので、公演側の記録をすべて足し合わせる
          const sung = singers.get(song.title) ?? new Set(song.singers)
          for (const id of variantSingers(variant, song)) sung.add(id)
          singers.set(song.title, sung)

          // 同じ回に何度出てきても、開催回は 1 度だけ数える
          const appeared = editions.get(song.title) ?? []
          if (appeared.at(-1) !== edition) appeared.push(edition)
          editions.set(song.title, appeared)
        }
      }
    }
  }

  const vocaloidOrder = [...catalog.vocaloids.keys()]
  // 一度も演奏されていない曲は検索結果に出さない (editions に載らない)
  const items = [...catalog.songs.values()].flatMap((song): IndexedSong[] => {
    const appeared = editions.get(song.title)
    if (appeared === undefined) return []
    const sung = singers.get(song.title) ?? new Set()
    return [
      {
        song,
        haystack: songSearchIndex(song),
        editions: appeared,
        singers: vocaloidOrder.filter((id) => sung.has(id)),
      },
    ]
  })
  return { items, byTitle: new Map(items.map((item) => [item.song.title, item])) }
}

/**
 * 部分一致で検索する。前方一致を優先し、次に登場回数の多い曲を上に出す。
 * 空クエリでは何も返さない。
 */
export function searchSongs(index: SongSearchIndex, query: string, limit = 40): SongSearchHit[] {
  const needle = query.trim().toLowerCase()
  if (needle === '') return []

  const scored: { item: IndexedSong; score: number }[] = []
  for (const item of index.items) {
    const position = item.haystack.indexOf(needle)
    if (position < 0) continue
    // 前方一致ほど小さいスコア、同点なら登場回数が多い方を上に
    scored.push({ item, score: position * 1000 - item.editions.length })
  }

  scored.sort((a, b) => a.score - b.score || a.item.song.title.localeCompare(b.item.song.title))

  return scored.slice(0, limit).map(({ item }) => ({
    song: item.song,
    editions: item.editions,
  }))
}
