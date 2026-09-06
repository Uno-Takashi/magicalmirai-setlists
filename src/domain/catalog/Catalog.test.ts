import { describe, expect, it } from 'vitest'
import type { Edition } from '@/domain/edition/Edition'
import type { Performance } from '@/domain/edition/Performance'
import type { Setlist } from '@/domain/setlist/Setlist'
import type { Song } from '@/domain/song/Song'
import type { Catalog, EditionEntry } from './Catalog'
import {
  defaultEntry,
  entryIndex,
  findEntry,
  getSong,
  latestEntry,
  validateCatalog,
} from './Catalog'

function performance(id: string): Performance {
  return { id, region: 'other', city: { ja: id }, shows: [] }
}

function edition(slug: string, year: number, performances: readonly Performance[] = []): Edition {
  return { year, slug, name: { ja: slug }, themeColors: [], performances }
}

function setlist(performanceIds: readonly string[], songs: readonly string[]): Setlist {
  return {
    performanceIds,
    tracks: songs.map((song, index) => ({
      order: index + 1,
      tags: [],
      variants: [{ song, shows: [] }],
    })),
  }
}

function catalog(entries: readonly EditionEntry[], songs: readonly string[] = []): Catalog {
  const master = new Map<string, Song>(
    songs.map((title) => [title, { title, producers: [], singers: [], links: {} }]),
  )
  return { entries, songs: master, vocaloids: new Map() }
}

describe('findEntry / entryIndex', () => {
  const subject = catalog([
    { edition: edition('2024', 2024), setlists: [] },
    { edition: edition('10th', 2023), setlists: [] },
  ])

  it('slug で開催回を引ける。10th のように西暦でない slug も同じに扱う', () => {
    expect(findEntry(subject, '10th')?.edition.year).toBe(2023)
    expect(entryIndex(subject, '10th')).toBe(1)
  })

  it('無い slug なら見つからない', () => {
    expect(findEntry(subject, '1999')).toBeUndefined()
    expect(entryIndex(subject, '1999')).toBe(-1)
  })
})

describe('latestEntry / defaultEntry', () => {
  it('最新は末尾の開催回', () => {
    const subject = catalog([
      { edition: edition('2024', 2024), setlists: [setlist(['tokyo'], ['A'])] },
      { edition: edition('2025', 2025), setlists: [setlist(['tokyo'], ['B'])] },
    ])
    expect(latestEntry(subject)?.edition.slug).toBe('2025')
  })

  it('開催が発表されただけの年が末尾にあると、初期表示はその手前まで戻る', () => {
    // 単に最新を選ぶと、空のページから始まってしまう
    const subject = catalog([
      { edition: edition('2025', 2025), setlists: [setlist(['tokyo'], ['A'])] },
      { edition: edition('2026', 2026), setlists: [] },
    ])
    expect(latestEntry(subject)?.edition.slug).toBe('2026')
    expect(defaultEntry(subject)?.edition.slug).toBe('2025')
  })

  it('セットリスト未収集の年が続いていても、ある年まで遡る', () => {
    const subject = catalog([
      { edition: edition('2024', 2024), setlists: [setlist(['tokyo'], ['A'])] },
      { edition: edition('2025', 2025), setlists: [] },
      { edition: edition('2026', 2026), setlists: [] },
    ])
    expect(defaultEntry(subject)?.edition.slug).toBe('2024')
  })

  it('どの年にもセットリストが無ければ、最新に落とす', () => {
    const subject = catalog([{ edition: edition('2026', 2026), setlists: [] }])
    expect(defaultEntry(subject)?.edition.slug).toBe('2026')
  })

  it('開催回が 1 つも無ければ undefined', () => {
    expect(defaultEntry(catalog([]))).toBeUndefined()
    expect(latestEntry(catalog([]))).toBeUndefined()
  })
})

describe('getSong', () => {
  it('曲名を自然キーにして楽曲マスタを引く', () => {
    const subject = catalog([], ['ネオンの通学路'])
    expect(getSong(subject, 'ネオンの通学路')?.title).toBe('ネオンの通学路')
    expect(getSong(subject, '無い曲')).toBeUndefined()
  })
})

describe('validateCatalog', () => {
  it('参照が揃っていれば何も言わない', () => {
    const subject = catalog(
      [
        {
          edition: edition('2024', 2024, [performance('tokyo')]),
          setlists: [setlist(['tokyo'], ['ネオンの通学路'])],
        },
      ],
      ['ネオンの通学路'],
    )
    expect(validateCatalog(subject)).toEqual([])
  })

  it('楽曲マスタに無い曲を参照していたら知らせる', () => {
    const subject = catalog(
      [
        {
          edition: edition('2024', 2024, [performance('tokyo')]),
          setlists: [setlist(['tokyo'], ['未登録の曲'])],
        },
      ],
      [],
    )
    const errors = validateCatalog(subject)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('未登録の曲')
  })

  it('セットリストが対応していない公演があれば知らせる', () => {
    const subject = catalog(
      [
        {
          edition: edition('2024', 2024, [performance('tokyo'), performance('osaka')]),
          setlists: [setlist(['tokyo'], ['ネオンの通学路'])],
        },
      ],
      ['ネオンの通学路'],
    )
    const errors = validateCatalog(subject)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('osaka')
  })

  it('セットリストがまだ無い年は、公演が対応していなくても咎めない', () => {
    // 開催が発表されただけの年をエラーにすると、収集前に CI が落ちてしまう
    const subject = catalog([
      { edition: edition('2026', 2026, [performance('tokyo')]), setlists: [] },
    ])
    expect(validateCatalog(subject)).toEqual([])
  })
})
