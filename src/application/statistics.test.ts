/**
 * 集計の数え方を固定する。
 *
 * 「累計」は (開催回, 曲) の組を 1 と数える、合作は各人に 1 曲ずつ数える、
 * ソロは 1 人で歌った曲だけ数える —— どれも画面の数字がそのまま変わる決まりなので、
 * 実データではなく作った小さなカタログで 1 つずつ確かめる。
 */

import { describe, expect, it } from 'vitest'
import type { Catalog, EditionEntry } from '@/domain/catalog/Catalog'
import type { Edition } from '@/domain/edition/Edition'
import type { Setlist } from '@/domain/setlist/Setlist'
import type { Track, TrackVariant } from '@/domain/setlist/Track'
import type { Song } from '@/domain/song/Song'
import type { Vocaloid, VocaloidId } from '@/domain/vocaloid/Vocaloid'
import {
  overallStats,
  producerRanking,
  songRanking,
  vocaloidRanking,
  vocaloidSoloRanking,
  vocaloidTrend,
} from './statistics'

const VOCALOIDS: readonly Vocaloid[] = [
  { id: 'miku', name: { ja: '初音ミク' }, color: '#39C5BB' },
  { id: 'rin', name: { ja: '鏡音リン' }, color: '#FFCC11' },
  { id: 'len', name: { ja: '鏡音レン' }, color: '#FFEE11' },
]

function song(title: string, producers: string[], singers: VocaloidId[]): Song {
  return { title, producers, singers, links: {} }
}

/** 候補を 1 つだけ持つ枠。 */
function fixed(order: number, title: string, tags: Track['tags'] = []): Track {
  return { order, tags, variants: [{ song: title, shows: [] }] }
}

/** 候補が複数ある枠。歌唱者の上書きも渡せる。 */
function variable(order: number, variants: TrackVariant[]): Track {
  return { order, tags: [], variants }
}

function setlist(tracks: Track[]): Setlist {
  return { performanceIds: ['tokyo'], tracks }
}

function entry(slug: string, year: number, tracks: Track[]): EditionEntry {
  const edition: Edition = {
    year,
    slug,
    name: { ja: slug },
    themeColors: [],
    performances: [],
  }
  return { edition, setlists: tracks.length === 0 ? [] : [setlist(tracks)] }
}

function catalog(entries: EditionEntry[], songs: Song[]): Catalog {
  return {
    entries,
    songs: new Map(songs.map((s) => [s.title, s])),
    vocaloids: new Map(VOCALOIDS.map((v) => [v.id, v])),
  }
}

describe('overallStats', () => {
  it('同じ回のなかで同じ曲が何度出ても、累計は 1 回と数える', () => {
    // 日替わり枠の候補とアンコールに同じ曲が出ることがある
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A'), fixed(2, 'A'), fixed(3, 'B')])],
      [song('A', ['P1'], ['miku']), song('B', ['P2'], ['miku'])],
    )
    expect(overallStats(subject).performanceCount).toBe(2)
  })

  it('別の回で歌われた同じ曲は、それぞれ 1 回と数える', () => {
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A')]), entry('2025', 2025, [fixed(1, 'A')])],
      [song('A', ['P1'], ['miku'])],
    )
    expect(overallStats(subject).performanceCount).toBe(2)
  })

  it('セットリスト未収集の年は開催回に数えない', () => {
    // 開催が発表されただけの年を数えると、集計の母数がずれる
    const subject = catalog(
      [entry('2025', 2025, [fixed(1, 'A')]), entry('2026', 2026, [])],
      [song('A', ['P1'], ['miku'])],
    )
    expect(overallStats(subject).editionCount).toBe(1)
  })

  it('円盤収録のみの枠は数えない', () => {
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A'), fixed(2, 'B', ['bonus-track'])])],
      [song('A', ['P1'], ['miku']), song('B', ['P2'], ['miku'])],
    )
    expect(overallStats(subject).performanceCount).toBe(1)
    expect(overallStats(subject).producerCount).toBe(1)
  })

  it('ボカロ P は重複を除いて数える', () => {
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A'), fixed(2, 'B')])],
      [song('A', ['P1'], ['miku']), song('B', ['P1'], ['miku'])],
    )
    expect(overallStats(subject).producerCount).toBe(1)
  })
})

describe('producerRanking', () => {
  it('合作は参加した各人にそれぞれ 1 曲として数える', () => {
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A')])],
      [song('A', ['P1', 'P2'], ['miku'])],
    )
    expect(producerRanking(subject)).toEqual([
      { producer: 'P1', songCount: 1, appearanceCount: 1 },
      { producer: 'P2', songCount: 1, appearanceCount: 1 },
    ])
  })

  it('曲数の多い順に並べる', () => {
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A'), fixed(2, 'B'), fixed(3, 'C')])],
      [song('A', ['P1'], []), song('B', ['P1'], []), song('C', ['P2'], [])],
    )
    expect(producerRanking(subject).map((s) => s.producer)).toEqual(['P1', 'P2'])
  })

  it('曲数が同じなら、累計演奏の多い順に並べる', () => {
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A'), fixed(2, 'B')]), entry('2025', 2025, [fixed(1, 'A')])],
      [song('A', ['P1'], []), song('B', ['P2'], [])],
    )
    const [first] = producerRanking(subject)
    expect(first).toEqual({ producer: 'P1', songCount: 1, appearanceCount: 2 })
  })

  it('同じ曲を別の回で歌うと、曲数は増えず累計だけ増える', () => {
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A')]), entry('2025', 2025, [fixed(1, 'A')])],
      [song('A', ['P1'], [])],
    )
    expect(producerRanking(subject)).toEqual([{ producer: 'P1', songCount: 1, appearanceCount: 2 }])
  })
})

describe('songRanking', () => {
  it('演奏された開催回の多い順に並べる', () => {
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A'), fixed(2, 'B')]), entry('2025', 2025, [fixed(1, 'A')])],
      [song('A', ['P1'], []), song('B', ['P2'], [])],
    )
    expect(songRanking(subject).map((s) => [s.song.title, s.editionCount])).toEqual([
      ['A', 2],
      ['B', 1],
    ])
  })

  it('楽曲マスタに無い曲は結果に出さない', () => {
    const subject = catalog([entry('2024', 2024, [fixed(1, '未登録')])], [])
    expect(songRanking(subject)).toEqual([])
  })
})

describe('vocaloidRanking', () => {
  it('セットリスト側の歌唱者の上書きを優先する', () => {
    // 楽曲マスタは原曲の歌唱者。その年だけ違うなら枠側が正しい
    const subject = catalog(
      [entry('2024', 2024, [variable(1, [{ song: 'A', shows: [], singers: ['rin'] }])])],
      [song('A', ['P1'], ['miku'])],
    )
    const byId = new Map(vocaloidRanking(subject).map((s) => [s.vocaloid.id, s.songCount]))
    expect(byId.get('rin')).toBe(1)
    expect(byId.get('miku')).toBe(0)
  })

  it('1 曲を複数人で歌うと、それぞれに 1 曲ずつ数える', () => {
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A')])],
      [song('A', ['P1'], ['rin', 'len'])],
    )
    const byId = new Map(vocaloidRanking(subject).map((s) => [s.vocaloid.id, s.songCount]))
    expect(byId.get('rin')).toBe(1)
    expect(byId.get('len')).toBe(1)
  })

  it('歌った記録が無いボーカロイドも 0 曲として並ぶ', () => {
    const subject = catalog([entry('2024', 2024, [fixed(1, 'A')])], [song('A', ['P1'], ['miku'])])
    expect(vocaloidRanking(subject)).toHaveLength(VOCALOIDS.length)
  })

  it('同じ曲を別の回で歌っても、曲数は 1 のまま', () => {
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A')]), entry('2025', 2025, [fixed(1, 'A')])],
      [song('A', ['P1'], ['miku'])],
    )
    const byId = new Map(vocaloidRanking(subject).map((s) => [s.vocaloid.id, s.songCount]))
    expect(byId.get('miku')).toBe(1)
  })
})

describe('vocaloidSoloRanking', () => {
  it('デュエットは誰にも数えない', () => {
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A'), fixed(2, 'B')])],
      [song('A', ['P1'], ['miku']), song('B', ['P2'], ['rin', 'len'])],
    )
    const byId = new Map(vocaloidSoloRanking(subject).map((s) => [s.vocaloid.id, s.songCount]))
    expect(byId.get('miku')).toBe(1)
    expect(byId.get('rin')).toBe(0)
    expect(byId.get('len')).toBe(0)
  })
})

describe('vocaloidTrend', () => {
  it('その回の曲数と、その回までの累計をそれぞれ返す', () => {
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A')]), entry('2025', 2025, [fixed(1, 'B')])],
      [song('A', ['P1'], ['miku']), song('B', ['P2'], ['miku'])],
    )
    const points = vocaloidTrend(subject)
    expect(points.map((p) => p.perEdition.get('miku'))).toEqual([1, 1])
    expect(points.map((p) => p.cumulative.get('miku'))).toEqual([1, 2])
  })

  it('同じ曲をまた歌っても、累計は増えない', () => {
    // 累計は「歌った曲の種類」。各年の足し算にはならない
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A')]), entry('2025', 2025, [fixed(1, 'A')])],
      [song('A', ['P1'], ['miku'])],
    )
    const points = vocaloidTrend(subject)
    expect(points.map((p) => p.perEdition.get('miku'))).toEqual([1, 1])
    expect(points.map((p) => p.cumulative.get('miku'))).toEqual([1, 1])
  })

  it('今回歌っていないボーカロイドも、累計は前回の値を保つ', () => {
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A')]), entry('2025', 2025, [fixed(1, 'B')])],
      [song('A', ['P1'], ['rin']), song('B', ['P2'], ['miku'])],
    )
    const [, second] = vocaloidTrend(subject)
    expect(second?.perEdition.get('rin')).toBeUndefined()
    expect(second?.cumulative.get('rin')).toBe(1)
  })

  it('最後の点は全開催回のランキングと一致する', () => {
    const subject = catalog(
      [entry('2024', 2024, [fixed(1, 'A')]), entry('2025', 2025, [fixed(1, 'B')])],
      [song('A', ['P1'], ['miku']), song('B', ['P2'], ['miku', 'rin'])],
    )
    const points = vocaloidTrend(subject)
    const last = points[points.length - 1]!
    for (const stat of vocaloidRanking(subject)) {
      expect(last.cumulative.get(stat.vocaloid.id) ?? 0).toBe(stat.songCount)
    }
  })

  it('セットリスト未収集の年は点を作らない', () => {
    const subject = catalog(
      [entry('2025', 2025, [fixed(1, 'A')]), entry('2026', 2026, [])],
      [song('A', ['P1'], ['miku'])],
    )
    expect(vocaloidTrend(subject)).toHaveLength(1)
  })
})
