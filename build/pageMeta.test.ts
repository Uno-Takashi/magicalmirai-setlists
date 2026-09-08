/**
 * ページの一覧。sitemap に載る URL と、書き出す HTML の両方がここから決まる。
 *
 * ここが実際のルーティング (`useRoute.ts`) とずれると、sitemap には載っているのに
 * 実体の無い URL や、その逆ができてしまう。
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { readEditions, sitePages, type EditionSummary, type PageMeta } from './pageMeta.ts'

const SITE = 'https://example.test/'

function edition(overrides: Partial<EditionSummary> = {}): EditionSummary {
  return {
    slug: '2023',
    year: 2023,
    name: 'サンプルミライ 2023',
    officialUrl: 'https://example.test/official/',
    from: '2023-08-11',
    to: '2023-09-03',
    venues: [{ venue: '架空ホール', city: '東京' }],
    ...overrides,
  }
}

/** 種類ごとに構造化データを引く。 */
function jsonLdOf(blocks: readonly object[], type: string): Record<string, unknown> | undefined {
  return blocks.find((block) => (block as { '@type': string })['@type'] === type) as
    | Record<string, unknown>
    | undefined
}

/** 開催回のページが `about` に持つ公演を取り出す。 */
function eventOf(page: PageMeta): Record<string, unknown> {
  const webPage = jsonLdOf(page.jsonLd, 'WebPage')
  if (webPage === undefined) throw new Error('WebPage の構造化データがありません')
  return webPage.about as Record<string, unknown>
}

describe('readEditions', () => {
  it('dataset を年の降順で読む', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pagemeta-'))
    for (const [name, year, slug] of [
      ['2022', 2022, '10th'],
      ['2024', 2024, '2024'],
    ] as const) {
      fs.mkdirSync(path.join(dir, name))
      fs.writeFileSync(
        path.join(dir, name, 'edition.yaml'),
        `year: ${year}\nslug: '${slug}'\nname:\n  ja: サンプル ${slug}\n`,
      )
    }
    // 年でない名前のものは読まない (README.md や songs.yaml が並んでいる)
    fs.writeFileSync(path.join(dir, 'songs.yaml'), 'x: 1\n')

    const editions = readEditions(dir)
    expect(editions.map((e) => e.slug)).toEqual(['2024', '10th'])
  })

  it('西暦でない slug も、ディレクトリ名ではなく slug をそのまま使う', () => {
    // 10 周年の回は「マジカルミライ 10th Anniversary」で西暦を持たない
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pagemeta-'))
    fs.mkdirSync(path.join(dir, '2022'))
    fs.writeFileSync(
      path.join(dir, '2022', 'edition.yaml'),
      "year: 2022\nslug: '10th'\nname:\n  ja: 10th\n",
    )
    expect(readEditions(dir)[0]?.slug).toBe('10th')
  })

  it('公演の日付から、最初と最後の開催日を拾う', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pagemeta-'))
    fs.mkdirSync(path.join(dir, '2023'))
    fs.writeFileSync(
      path.join(dir, '2023', 'edition.yaml'),
      [
        'year: 2023',
        "slug: '2023'",
        'name:',
        '  ja: サンプル',
        'performances:',
        '  - city:',
        '      ja: 東京',
        '    venue:',
        '      ja: 架空ホール',
        '    shows:',
        '      - date: 2023-09-03',
        '      - date: 2023-08-11',
        '',
      ].join('\n'),
    )
    const [found] = readEditions(dir)
    expect(found?.from).toBe('2023-08-11')
    expect(found?.to).toBe('2023-09-03')
    expect(found?.venues).toEqual([{ venue: '架空ホール', city: '東京' }])
  })

  it('日程や会場が未発表でも読める', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pagemeta-'))
    fs.mkdirSync(path.join(dir, '2026'))
    fs.writeFileSync(
      path.join(dir, '2026', 'edition.yaml'),
      "year: 2026\nslug: '2026'\nname:\n  ja: サンプル 2026\n",
    )
    const [found] = readEditions(dir)
    expect(found?.from).toBeUndefined()
    expect(found?.venues).toEqual([])
  })
})

describe('sitePages', () => {
  const pages = sitePages(SITE, [
    edition(),
    edition({ slug: '2024', year: 2024, name: 'サンプル 2024' }),
  ])

  it('サイトの入口と、開催回と、統計まわりをすべて並べる', () => {
    expect(pages.map((p) => p.path)).toEqual([
      '',
      '2023',
      '2024',
      'statics',
      'statics/producers',
      'statics/songs',
      'statics/vocaloids',
    ])
  })

  it('URL は重複しない', () => {
    expect(new Set(pages.map((p) => p.path)).size).toBe(pages.length)
  })

  it('どのページにも説明文がある', () => {
    for (const page of pages) expect(page.description.length, page.path).toBeGreaterThan(0)
  })

  it('サイトの入口だけは見出しを持たない (サイト名がそのまま title になる)', () => {
    expect(pages[0]?.title).toBeUndefined()
    for (const page of pages.slice(1)) expect(page.title, page.path).toBeTruthy()
  })

  it('開催回のページは、公演を about に置いた WebPage になる', () => {
    // このサイトは公演を主催する側ではないので、ページそのものを MusicEvent にしない
    const page = pages.find((p) => p.path === '2023')!
    expect(jsonLdOf(page.jsonLd, 'WebPage')?.url).toBe('https://example.test/2023')
    expect((eventOf(page) as { '@type': string })['@type']).toBe('MusicEvent')
  })

  it('公演には日程・会場・出演を載せる', () => {
    const event = eventOf(pages.find((p) => p.path === '2023')!)
    expect(event.startDate).toBe('2023-08-11')
    expect(event.endDate).toBe('2023-09-03')
    expect(event.url).toBe('https://example.test/official/')
    expect(event.performer).toEqual({ '@type': 'MusicGroup', name: '初音ミク' })
    expect(event.location).toHaveLength(1)
  })

  it('日程が未発表の回は、その項目を持たせない', () => {
    // 空文字を入れると「開催日が不明」ではなく「不正な日付」になってしまう
    const event = eventOf(
      sitePages(SITE, [edition({ from: undefined, to: undefined, venues: [] })])[1]!,
    )
    expect('startDate' in event).toBe(false)
    expect('location' in event).toBe(false)
  })

  it('サイトの入口はパンくずを持たない', () => {
    expect(pages[0]?.jsonLd).toEqual([])
  })

  it('開催回のページのパンくずは、入口からの 2 段になる', () => {
    const page = pages.find((p) => p.path === '2023')!
    const crumbs = jsonLdOf(page.jsonLd, 'BreadcrumbList')?.itemListElement as {
      position: number
      item: string
    }[]
    expect(crumbs.map((c) => c.item)).toEqual([
      'https://example.test/',
      'https://example.test/2023',
    ])
    expect(crumbs.map((c) => c.position)).toEqual([1, 2])
  })

  it('ランキングのページのパンくずは、統計を挟んだ 3 段になる', () => {
    const page = pages.find((p) => p.path === 'statics/songs')!
    const crumbs = jsonLdOf(page.jsonLd, 'BreadcrumbList')?.itemListElement as { item: string }[]
    expect(crumbs.map((c) => c.item)).toEqual([
      'https://example.test/',
      'https://example.test/statics',
      'https://example.test/statics/songs',
    ])
  })

  it('統計まわりのページは CollectionPage になる', () => {
    for (const path of ['statics', 'statics/songs']) {
      const page = pages.find((p) => p.path === path)!
      expect(jsonLdOf(page.jsonLd, 'CollectionPage')?.url, path).toBe(`${SITE}${path}`)
    }
  })

  it('どのページの構造化データもサイト本体に紐づける', () => {
    for (const page of pages.slice(1)) {
      const self = jsonLdOf(page.jsonLd, 'WebPage') ?? jsonLdOf(page.jsonLd, 'CollectionPage')
      expect(self?.isPartOf, page.path).toEqual({ '@id': `${SITE}#website` })
    }
  })
})

describe('実際の dataset', () => {
  const editions = readEditions(path.resolve(import.meta.dirname, '..', 'dataset'))
  const pages = sitePages(SITE, editions)

  it('すべての開催回にページがある', () => {
    for (const found of editions) {
      expect(
        pages.some((page) => page.path === found.slug),
        found.slug,
      ).toBe(true)
    }
  })

  it('URL に使えない文字を slug に持たせない', () => {
    // slug はそのままパスとファイル名になる
    for (const found of editions) expect(found.slug, found.slug).toMatch(/^[\w-]+$/)
  })

  it('開催回のページの説明文に、その回の名前が入る', () => {
    for (const found of editions) {
      const page = pages.find((p) => p.path === found.slug)!
      expect(page.description, found.slug).toContain(found.name)
    }
  })
})
