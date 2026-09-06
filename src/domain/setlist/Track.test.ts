import { describe, expect, it } from 'vitest'
import type { Song } from '@/domain/song/Song'
import { isVariable, performanceIdOf, showIdOf, trackSongs, variantSingers } from './Track'
import type { Track, TrackVariant } from './Track'

const song: Song = {
  title: 'ネオンの通学路',
  producers: ['サンプルP'],
  singers: ['miku'],
  links: {},
}

describe('performanceIdOf / showIdOf', () => {
  it('`<公演 id>/<公演回 id>` を 2 つに割る', () => {
    expect(performanceIdOf('tokyo/day1')).toBe('tokyo')
    expect(showIdOf('tokyo/day1')).toBe('day1')
  })

  it('区切りが無い参照でも落ちない', () => {
    expect(performanceIdOf('tokyo')).toBe('tokyo')
    expect(showIdOf('tokyo')).toBe('')
  })
})

describe('variantSingers', () => {
  it('公演側に上書きがあれば、そちらを優先する', () => {
    // 同じ曲でも年によって歌う人が変わる。枠側の記録が常に正しい
    const variant: TrackVariant = { song: song.title, shows: [], singers: ['rin', 'len'] }
    expect(variantSingers(variant, song)).toEqual(['rin', 'len'])
  })

  it('上書きが無ければ楽曲マスタの原曲歌唱者を使う', () => {
    const variant: TrackVariant = { song: song.title, shows: [] }
    expect(variantSingers(variant, song)).toEqual(['miku'])
  })

  it('どちらも無ければ空', () => {
    const variant: TrackVariant = { song: '未知の曲', shows: [] }
    expect(variantSingers(variant, undefined)).toEqual([])
  })

  it('上書きが空配列なら、それを尊重して楽曲マスタへ落とさない', () => {
    const variant: TrackVariant = { song: song.title, shows: [], singers: [] }
    expect(variantSingers(variant, song)).toEqual([])
  })
})

describe('isVariable / trackSongs', () => {
  const fixed: Track = { order: 1, tags: [], variants: [{ song: 'A', shows: [] }] }
  const variable: Track = {
    order: 2,
    tags: [],
    variants: [
      { song: 'A', shows: [] },
      { song: 'B', shows: [] },
    ],
  }

  it('候補が 1 つだけの枠は固定曲', () => {
    expect(isVariable(fixed)).toBe(false)
  })

  it('候補が複数ある枠は入れ替わる枠', () => {
    expect(isVariable(variable)).toBe(true)
  })

  it('枠の候補の曲名を、並びのまま返す', () => {
    expect(trackSongs(variable)).toEqual(['A', 'B'])
  })
})
