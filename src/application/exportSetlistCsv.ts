/**
 * セットリストを CSV に書き出すユースケース。
 *
 * 表計算ソフトで開いて並べ替えたり、他の年と見比べたりするための持ち出し口。
 * 画面に出している情報 (曲順・曲名・作曲者・歌唱者・タグ・演奏された回) を
 * そのまま列にする。
 *
 * 見出しの文言は呼び出し側から渡す。ここに翻訳を持ち込むと、表示の都合が
 * ユースケースに混ざるため。
 */

import type { Edition } from '@/domain/edition/Edition'
import type { Performance } from '@/domain/edition/Performance'
import { performedTracks, type Setlist } from '@/domain/setlist/Setlist'
import { performanceIdOf, showIdOf, variantSingers, type Track } from '@/domain/setlist/Track'
import type { Catalog } from '@/domain/catalog/Catalog'

/** 候補ごとに 1 行。同じ枠に候補が複数あるときは、曲順が同じ行が並ぶ。 */
export interface SetlistCsvRow {
  readonly order: number
  readonly title: string
  readonly producers: string
  readonly singers: string
  readonly tags: string
  /** その候補が演奏された公演回。固定曲は空。 */
  readonly shows: string
}

/** 1 つのセルの中で値を並べるときの区切り。カンマは CSV の区切りと紛らわしい。 */
const VALUE_SEPARATOR = ' / '

function showLabel(edition: Edition, ref: string): string {
  const performance: Performance | undefined = edition.performances.find(
    (candidate) => candidate.id === performanceIdOf(ref),
  )
  const show = performance?.shows.find((candidate) => candidate.id === showIdOf(ref))
  if (performance === undefined || show === undefined) return ref
  // 公演地は日本語表記で書き出す。ロケールに寄せると同じ公演が別の名前になり、
  // 書き出した CSV どうしを突き合わせられなくなる。
  return `${performance.city.ja} ${show.label}`
}

function rowsOfTrack(track: Track, edition: Edition, catalog: Catalog): SetlistCsvRow[] {
  return track.variants.map((variant) => {
    const song = catalog.songs.get(variant.song)
    const singers = variantSingers(variant, song).map(
      (id) => catalog.vocaloids.get(id)?.name.ja ?? id,
    )
    return {
      order: track.order,
      title: variant.song,
      producers: (song?.producers ?? []).join(VALUE_SEPARATOR),
      singers: singers.join(VALUE_SEPARATOR),
      tags: track.tags.join(VALUE_SEPARATOR),
      shows:
        variant.shows.length > 0
          ? variant.shows.map((ref) => showLabel(edition, ref)).join(VALUE_SEPARATOR)
          : (variant.note ?? ''),
    }
  })
}

export function setlistCsvRows(
  setlist: Setlist,
  edition: Edition,
  catalog: Catalog,
): SetlistCsvRow[] {
  return performedTracks(setlist).flatMap((track) => rowsOfTrack(track, edition, catalog))
}

/** 値に区切りや引用符・改行が入っていたら囲う。RFC 4180 に従う。 */
function escapeCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/**
 * CSV の本文を作る。
 *
 * 改行は CRLF。Excel をはじめ、CSV を読む多くのソフトがこれを前提にしている。
 */
export function toCsv(headers: readonly string[], rows: readonly SetlistCsvRow[]): string {
  const lines = rows.map((row) =>
    [String(row.order), row.title, row.producers, row.singers, row.tags, row.shows]
      .map(escapeCell)
      .join(','),
  )
  return [headers.map(escapeCell).join(','), ...lines].join('\r\n')
}

/**
 * 書き出すファイルの名前。
 *
 * 開催回が複数のセットリストを持つ年は、どれを書き出したのかが分かるように
 * 通し番号を付ける。
 */
export function setlistCsvFilename(edition: Edition, setlistIndex: number, total: number): string {
  const suffix = total > 1 ? `-${setlistIndex + 1}` : ''
  return `magicalmirai-${edition.slug}-setlist${suffix}.csv`
}
