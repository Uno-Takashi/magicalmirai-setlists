/**
 * データセット全体の集約。開催回・楽曲・ボーカロイドを 1 つにまとめ、
 * 参照整合性 (セットリストの曲が楽曲マスタに存在すること) を保証する。
 */

import type { Edition } from '@/domain/edition/Edition'
import type { Setlist } from '@/domain/setlist/Setlist'
import type { Song, SongTitle } from '@/domain/song/Song'
import type { Vocaloid, VocaloidId } from '@/domain/vocaloid/Vocaloid'

/** 1 開催回とそのセットリストの組。 */
export interface EditionEntry {
  readonly edition: Edition
  readonly setlists: readonly Setlist[]
}

export interface Catalog {
  /** 開催年の昇順。 */
  readonly entries: readonly EditionEntry[]
  readonly songs: ReadonlyMap<SongTitle, Song>
  readonly vocaloids: ReadonlyMap<VocaloidId, Vocaloid>
}

export function findEntry(catalog: Catalog, slug: string): EditionEntry | undefined {
  return catalog.entries.find((entry) => entry.edition.slug === slug)
}

export function entryIndex(catalog: Catalog, slug: string): number {
  return catalog.entries.findIndex((entry) => entry.edition.slug === slug)
}

/** 最新の開催回。 */
export function latestEntry(catalog: Catalog): EditionEntry | undefined {
  return catalog.entries[catalog.entries.length - 1]
}

/**
 * 初期表示に使う開催回。
 *
 * 開催が発表されただけでセットリスト未収集の年が末尾に並ぶため、単に最新を選ぶと
 * 空のページから始まってしまう。セットリストがある最新の回を優先する。
 */
export function defaultEntry(catalog: Catalog): EditionEntry | undefined {
  for (let i = catalog.entries.length - 1; i >= 0; i -= 1) {
    const entry = catalog.entries[i]
    if (entry !== undefined && entry.setlists.length > 0) return entry
  }
  return latestEntry(catalog)
}

export function getSong(catalog: Catalog, title: SongTitle): Song | undefined {
  return catalog.songs.get(title)
}

/** セットリストが参照する曲がすべて楽曲マスタにあるかを検証する。 */
export function validateCatalog(catalog: Catalog): string[] {
  const errors: string[] = []
  for (const { edition, setlists } of catalog.entries) {
    for (const setlist of setlists) {
      for (const track of setlist.tracks) {
        for (const variant of track.variants) {
          if (!catalog.songs.has(variant.song)) {
            errors.push(
              `${edition.slug}: ${track.order}曲目の "${variant.song}" が dataset/songs.yaml にありません`,
            )
          }
        }
      }
    }
    for (const performance of edition.performances) {
      const covered = setlists.some((setlist) => setlist.performanceIds.includes(performance.id))
      if (!covered && setlists.length > 0) {
        errors.push(`${edition.slug}: 公演 "${performance.id}" に対応するセットリストがありません`)
      }
    }
  }
  return errors
}
