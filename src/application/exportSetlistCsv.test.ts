import { describe, expect, it } from 'vitest'
import type { Catalog } from '@/domain/catalog/Catalog'
import type { Edition } from '@/domain/edition/Edition'
import type { Performance } from '@/domain/edition/Performance'
import type { Setlist } from '@/domain/setlist/Setlist'
import type { Track } from '@/domain/setlist/Track'
import type { Song } from '@/domain/song/Song'
import type { Vocaloid } from '@/domain/vocaloid/Vocaloid'
import { setlistCsvFilename, setlistCsvRows, toCsv } from './exportSetlistCsv'

const VOCALOIDS: readonly Vocaloid[] = [
  { id: 'miku', name: { ja: '初音ミク', en: 'Hatsune Miku' }, color: '#39C5BB' },
  { id: 'rin', name: { ja: '鏡音リン', en: 'Kagamine Rin' }, color: '#FFCC11' },
]

const TOKYO: Performance = {
  id: 'tokyo',
  region: 'tokyo',
  city: { ja: '東京', en: 'Tokyo' },
  shows: [
    { id: 'day1', date: '2024-08-30', label: 'Day.1' },
    { id: 'day2', date: '2024-08-31', label: 'Day.2' },
  ],
}

const EDITION: Edition = {
  year: 2024,
  slug: '2024',
  name: { ja: 'マジカルミライ 2024' },
  themeColors: [],
  performances: [TOKYO],
}

const SONGS: readonly Song[] = [
  { title: 'ネオンの通学路', producers: ['サンプルP'], singers: ['miku'], links: {} },
  { title: 'ダブル・ドライヴ', producers: ['サンプルP', 'モックP'], singers: ['rin'], links: {} },
  { title: 'Hello, Fixture', producers: ['モックP'], singers: ['miku'], links: {} },
]

const CATALOG: Catalog = {
  entries: [],
  songs: new Map(SONGS.map((s) => [s.title, s])),
  vocaloids: new Map(VOCALOIDS.map((v) => [v.id, v])),
}

function setlist(tracks: Track[]): Setlist {
  return { performanceIds: ['tokyo'], tracks }
}

describe('setlistCsvRows', () => {
  it('候補ごとに 1 行を作り、同じ枠なら曲順を揃える', () => {
    const subject = setlist([
      {
        order: 3,
        tags: [],
        variants: [
          { song: 'ネオンの通学路', shows: ['tokyo/day1'] },
          { song: 'Hello, Fixture', shows: ['tokyo/day2'] },
        ],
      },
    ])
    const rows = setlistCsvRows(subject, EDITION, CATALOG)
    expect(rows.map((r) => [r.order, r.title])).toEqual([
      [3, 'ネオンの通学路'],
      [3, 'Hello, Fixture'],
    ])
  })

  it('公演回は「公演地 ラベル」の形に開く', () => {
    const subject = setlist([
      { order: 1, tags: [], variants: [{ song: 'ネオンの通学路', shows: ['tokyo/day1'] }] },
    ])
    expect(setlistCsvRows(subject, EDITION, CATALOG)[0]?.shows).toBe('東京 Day.1')
  })

  it('公演地は常に日本語で書き出す。CSV どうしを突き合わせられるようにするため', () => {
    const subject = setlist([
      { order: 1, tags: [], variants: [{ song: 'ネオンの通学路', shows: ['tokyo/day1'] }] },
    ])
    expect(setlistCsvRows(subject, EDITION, CATALOG)[0]?.shows).not.toContain('Tokyo')
  })

  it('公演回をたどれない候補は、出典の条件をそのまま書く', () => {
    const subject = setlist([
      {
        order: 1,
        tags: [],
        variants: [{ song: 'ネオンの通学路', shows: [], note: '東京公演のみ' }],
      },
    ])
    expect(setlistCsvRows(subject, EDITION, CATALOG)[0]?.shows).toBe('東京公演のみ')
  })

  it('固定曲は演奏された回の欄を空にする', () => {
    const subject = setlist([
      { order: 1, tags: [], variants: [{ song: 'ネオンの通学路', shows: [] }] },
    ])
    expect(setlistCsvRows(subject, EDITION, CATALOG)[0]?.shows).toBe('')
  })

  it('合作と複数の歌唱者は、カンマ以外の区切りで並べる', () => {
    const subject = setlist([
      {
        order: 1,
        tags: [],
        variants: [{ song: 'ダブル・ドライヴ', shows: [], singers: ['miku', 'rin'] }],
      },
    ])
    const row = setlistCsvRows(subject, EDITION, CATALOG)[0]!
    expect(row.producers).toBe('サンプルP / モックP')
    expect(row.singers).toBe('初音ミク / 鏡音リン')
  })

  it('歌唱者はセットリスト側の上書きを優先する', () => {
    const subject = setlist([
      { order: 1, tags: [], variants: [{ song: 'ネオンの通学路', shows: [], singers: ['rin'] }] },
    ])
    expect(setlistCsvRows(subject, EDITION, CATALOG)[0]?.singers).toBe('鏡音リン')
  })

  it('円盤収録のみの枠は書き出さない', () => {
    const subject = setlist([
      { order: 1, tags: [], variants: [{ song: 'ネオンの通学路', shows: [] }] },
      { order: 2, tags: ['bonus-track'], variants: [{ song: 'Hello, Fixture', shows: [] }] },
    ])
    expect(setlistCsvRows(subject, EDITION, CATALOG).map((r) => r.title)).toEqual([
      'ネオンの通学路',
    ])
  })

  it('枠のタグを並べる', () => {
    const subject = setlist([
      {
        order: 1,
        tags: ['encore', 'theme-song'],
        variants: [{ song: 'ネオンの通学路', shows: [] }],
      },
    ])
    expect(setlistCsvRows(subject, EDITION, CATALOG)[0]?.tags).toBe('encore / theme-song')
  })
})

describe('toCsv', () => {
  const headers = ['曲順', '曲名', '作曲者', '歌唱', 'タグ', '公演回']

  function rowOf(title: string) {
    return { order: 1, title, producers: '', singers: '', tags: '', shows: '' }
  }

  it('見出しを先頭に置き、改行は CRLF にする', () => {
    const csv = toCsv(headers, [rowOf('A')])
    expect(csv.split('\r\n')[0]).toBe(headers.join(','))
    expect(csv.split('\r\n')).toHaveLength(2)
  })

  it('カンマを含む値は引用符で囲む', () => {
    // 囲まないと 1 つの値が 2 つの列に割れる
    expect(toCsv(headers, [rowOf('Hello, Fixture')])).toContain('"Hello, Fixture"')
  })

  it('引用符を含む値は引用符を二重にして囲む (RFC 4180)', () => {
    expect(toCsv(headers, [rowOf('"引用" のある曲')])).toContain('"""引用"" のある曲"')
  })

  it('改行を含む値も囲む', () => {
    expect(toCsv(headers, [rowOf('前\n後')])).toContain('"前\n後"')
  })

  it('囲む必要のない値はそのまま出す', () => {
    expect(toCsv(headers, [rowOf('ネオンの通学路')])).toContain(',ネオンの通学路,')
  })

  it('行が無くても見出しだけは出す', () => {
    expect(toCsv(headers, [])).toBe(headers.join(','))
  })
})

describe('setlistCsvFilename', () => {
  it('セットリストが 1 つだけの年は通し番号を付けない', () => {
    expect(setlistCsvFilename(EDITION, 0, 1)).toBe('magicalmirai-2024-setlist.csv')
  })

  it('複数のセットリストを持つ年は、どれを書き出したか分かるようにする', () => {
    expect(setlistCsvFilename(EDITION, 0, 2)).toBe('magicalmirai-2024-setlist-1.csv')
    expect(setlistCsvFilename(EDITION, 1, 2)).toBe('magicalmirai-2024-setlist-2.csv')
  })

  it('西暦でない slug もそのまま使う', () => {
    const tenth = { ...EDITION, slug: '10th' }
    expect(setlistCsvFilename(tenth, 0, 1)).toBe('magicalmirai-10th-setlist.csv')
  })
})
