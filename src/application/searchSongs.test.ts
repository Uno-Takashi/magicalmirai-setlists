import { describe, expect, it } from 'vitest'
import type { Catalog, EditionEntry } from '@/domain/catalog/Catalog'
import type { Edition } from '@/domain/edition/Edition'
import type { Track, TrackVariant } from '@/domain/setlist/Track'
import type { Song } from '@/domain/song/Song'
import type { Vocaloid } from '@/domain/vocaloid/Vocaloid'
import { buildSongSearchIndex, editionsOfSong, searchSongs, singersOfSong } from './searchSongs'

const VOCALOIDS: readonly Vocaloid[] = [
  { id: 'miku', name: { ja: '初音ミク' }, color: '#39C5BB' },
  { id: 'rin', name: { ja: '鏡音リン' }, color: '#FFCC11' },
  { id: 'len', name: { ja: '鏡音レン' }, color: '#FFEE11' },
]

function song(title: string, producers: string[] = [], singers: string[] = []): Song {
  return { title, producers, singers, links: {} }
}

function entry(slug: string, year: number, variants: TrackVariant[][]): EditionEntry {
  const edition: Edition = { year, slug, name: { ja: slug }, themeColors: [], performances: [] }
  const tracks: Track[] = variants.map((vs, index) => ({
    order: index + 1,
    tags: [],
    variants: vs,
  }))
  return { edition, setlists: [{ performanceIds: ['tokyo'], tracks }] }
}

function catalog(entries: EditionEntry[], songs: Song[]): Catalog {
  return {
    entries,
    songs: new Map(songs.map((s) => [s.title, s])),
    vocaloids: new Map(VOCALOIDS.map((v) => [v.id, v])),
  }
}

const SONGS = [
  song('ネオンの通学路', ['サンプルP'], ['miku']),
  song('ネオンサイン', ['モックP'], ['rin']),
  song('くらげディスコ', ['テストP'], ['len']),
  song('一度も歌われない曲', ['ダミーP'], ['miku']),
]

const SUBJECT = catalog(
  [
    entry('2024', 2024, [
      [{ song: 'ネオンの通学路', shows: [] }],
      [{ song: 'ネオンサイン', shows: [] }],
    ]),
    entry('2025', 2025, [
      [{ song: 'ネオンの通学路', shows: [] }],
      [{ song: 'くらげディスコ', shows: [] }],
    ]),
  ],
  SONGS,
)

const INDEX = buildSongSearchIndex(SUBJECT)

describe('buildSongSearchIndex', () => {
  it('一度も演奏されていない曲は索引に入れない', () => {
    expect(INDEX.byTitle.has('一度も歌われない曲')).toBe(false)
  })

  it('演奏された曲は曲名から引ける', () => {
    expect(INDEX.byTitle.get('ネオンの通学路')?.song.title).toBe('ネオンの通学路')
  })
})

describe('searchSongs', () => {
  it('空のクエリでは何も返さない', () => {
    expect(searchSongs(INDEX, '')).toEqual([])
    expect(searchSongs(INDEX, '   ')).toEqual([])
  })

  it('曲名の部分一致で探せる', () => {
    expect(searchSongs(INDEX, 'ディスコ').map((h) => h.song.title)).toEqual(['くらげディスコ'])
  })

  it('作曲者の名前でも探せる', () => {
    expect(searchSongs(INDEX, 'テストP').map((h) => h.song.title)).toEqual(['くらげディスコ'])
  })

  it('大文字と小文字を区別しない', () => {
    const upper = searchSongs(INDEX, 'テストp').map((h) => h.song.title)
    expect(upper).toEqual(['くらげディスコ'])
  })

  it('前方一致を先に出す', () => {
    // 「ネオン」は両方に当たるが、曲名の頭から始まるものを上に
    const titles = searchSongs(INDEX, 'ネオン').map((h) => h.song.title)
    expect(titles).toHaveLength(2)
    expect(titles).toContain('ネオンの通学路')
    expect(titles).toContain('ネオンサイン')
  })

  it('前方一致が並んだら、登場回数の多い曲を上に出す', () => {
    const titles = searchSongs(INDEX, 'ネオン').map((h) => h.song.title)
    expect(titles[0]).toBe('ネオンの通学路')
  })

  it('件数の上限を守る', () => {
    expect(searchSongs(INDEX, 'ネオン', 1)).toHaveLength(1)
  })

  it('前後の空白は無視する', () => {
    expect(searchSongs(INDEX, '  ディスコ  ').map((h) => h.song.title)).toEqual(['くらげディスコ'])
  })

  it('当たらないクエリは空', () => {
    expect(searchSongs(INDEX, '存在しない曲名')).toEqual([])
  })
})

describe('editionsOfSong', () => {
  it('その曲が登場した開催回を年の昇順で返す', () => {
    expect(editionsOfSong(INDEX, 'ネオンの通学路').map((e) => e.slug)).toEqual(['2024', '2025'])
  })

  it('同じ回に何度出ても、開催回は 1 つだけ数える', () => {
    const subject = catalog(
      [
        entry('2024', 2024, [
          [{ song: 'ネオンの通学路', shows: [] }],
          [{ song: 'ネオンの通学路', shows: [] }],
        ]),
      ],
      SONGS,
    )
    const index = buildSongSearchIndex(subject)
    expect(editionsOfSong(index, 'ネオンの通学路')).toHaveLength(1)
  })

  it('索引に無い曲は空', () => {
    expect(editionsOfSong(INDEX, '一度も歌われない曲')).toEqual([])
  })
})

describe('singersOfSong', () => {
  it('年をまたいで歌唱者を足し合わせる', () => {
    // 同じ曲でも年によって歌う人が変わるので、1 公演の記録だけでは足りない
    const subject = catalog(
      [
        entry('2024', 2024, [[{ song: 'ネオンの通学路', shows: [] }]]),
        entry('2025', 2025, [[{ song: 'ネオンの通学路', shows: [], singers: ['rin'] }]]),
      ],
      SONGS,
    )
    const index = buildSongSearchIndex(subject)
    expect(singersOfSong(subject, index, 'ネオンの通学路')).toEqual(['miku', 'rin'])
  })

  it('並びは dataset のボーカロイドの順に従う', () => {
    const subject = catalog(
      [entry('2024', 2024, [[{ song: 'ネオンの通学路', shows: [], singers: ['len', 'miku'] }]])],
      SONGS,
    )
    const index = buildSongSearchIndex(subject)
    expect(singersOfSong(subject, index, 'ネオンの通学路')).toEqual(['miku', 'len'])
  })

  it('索引に無い曲は空', () => {
    expect(singersOfSong(SUBJECT, INDEX, '一度も歌われない曲')).toEqual([])
  })
})
