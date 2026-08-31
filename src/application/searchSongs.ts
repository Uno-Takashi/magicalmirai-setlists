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
  readonly editions: Edition[]
  /** その曲を歌ったボーカロイドの和集合 (全開催回をまたぐ)。 */
  readonly singers: Set<VocaloidId>
}

export interface SongSearchIndex {
  readonly items: readonly IndexedSong[]
  /** 曲名から引くための索引。1 曲ずつの照会が描画のたびに何度も走るため。 */
  readonly byTitle: ReadonlyMap<SongTitle, IndexedSong>
}

/**
 * その曲を歌ったボーカロイドの和集合。
 * 年によって歌唱者が変わるので、1 つの公演の記録だけでは足りない。
 * 並びは dataset/vocaloids.yaml の順 (ミク → リン → レン → ルカ → MEIKO → KAITO)。
 */
export function singersOfSong(
  catalog: Catalog,
  index: SongSearchIndex,
  title: SongTitle,
): readonly VocaloidId[] {
  const found = index.byTitle.get(title)?.singers
  if (found === undefined) return []
  return [...catalog.vocaloids.keys()].filter((id) => found.has(id))
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
  const byTitle = new Map<string, IndexedSong>()

  for (const song of catalog.songs.values()) {
    byTitle.set(song.title, {
      song,
      haystack: songSearchIndex(song),
      editions: [],
      singers: new Set(song.singers),
    })
  }

  for (const { edition, setlists } of catalog.entries) {
    const seen = new Set<string>()
    for (const setlist of setlists) {
      for (const track of setlist.tracks) {
        for (const variant of track.variants) {
          const item = byTitle.get(variant.song)
          if (item === undefined) continue
          // 歌唱者は年ごとに変わるので、公演側の記録をすべて足し合わせる
          for (const id of variantSingers(variant, item.song)) item.singers.add(id)
          if (seen.has(variant.song)) continue
          seen.add(variant.song)
          item.editions.push(edition)
        }
      }
    }
  }

  // 一度も演奏されていない曲は検索結果に出さない
  const items = [...byTitle.values()].filter((item) => item.editions.length > 0)
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
