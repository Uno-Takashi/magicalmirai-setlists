import { describe, expect, it } from 'vitest'
import type { Track } from './Track'
import { bonusTracks, findTaggedSong, performedTracks } from './Setlist'
import type { Setlist } from './Setlist'

function track(order: number, song: string, tags: Track['tags'] = []): Track {
  return { order, tags, variants: [{ song, shows: [] }] }
}

const setlist: Setlist = {
  performanceIds: ['tokyo'],
  tracks: [
    track(1, 'ネオンの通学路'),
    track(2, 'くらげディスコ', ['theme-song']),
    track(3, 'ゼロ番目の海', ['grand-prix']),
    track(4, 'とおいひかり', ['encore']),
    track(5, '未明のスケッチ', ['bonus-track']),
  ],
}

describe('findTaggedSong', () => {
  it('テーマソングの曲名を引ける', () => {
    expect(findTaggedSong(setlist, 'theme-song')).toBe('くらげディスコ')
  })

  it('楽曲グランプリの曲名を引ける', () => {
    expect(findTaggedSong(setlist, 'grand-prix')).toBe('ゼロ番目の海')
  })

  it('そのタグの枠が無ければ undefined', () => {
    expect(findTaggedSong(setlist, 'band-intro')).toBeUndefined()
  })
})

describe('performedTracks / bonusTracks', () => {
  it('円盤収録のみの枠は、演奏された枠に含めない', () => {
    expect(performedTracks(setlist).map((t) => t.order)).toEqual([1, 2, 3, 4])
  })

  it('円盤収録のみの枠だけを取り出せる', () => {
    expect(bonusTracks(setlist).map((t) => t.order)).toEqual([5])
  })

  it('2 つを合わせると元の枠がすべてそろう', () => {
    expect(performedTracks(setlist).length + bonusTracks(setlist).length).toBe(
      setlist.tracks.length,
    )
  })
})
