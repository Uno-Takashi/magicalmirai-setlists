/**
 * dataset/ の検証。ブラウザではなく Node で走る (vite.config.ts の `dataset` プロジェクト)。
 *
 * dataset の YAML は文字列としてバンドルされ、パースはアプリの実行時に起きる。
 * つまり `pnpm build` は YAML を一切解釈せず、壊れたデータでもビルドは通り、
 * 開いたときに初めて真っ白になる。Storybook のテストは `src/fixtures/` の作り物を
 * 使うので dataset を読まない。**dataset の誤りを CI で止められるのはここだけ。**
 *
 * 見るものは 3 段階。
 *
 * 1. YAML として読めるか (重複キーもここで落ちる)
 * 2. `datasetSchema.ts` のスキーマに合うか (キーのタイポ・未知の値・形式)
 * 3. ファイルをまたいだ参照が解決するか (曲名・ボーカロイド・公演回)
 */

import { parse } from 'yaml'
import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import type { Catalog } from '@/domain/catalog/Catalog'
import { performanceIdOf, showIdOf } from '@/domain/setlist/Track'
import { LOCALES } from '@/infrastructure/i18n/i18n'
import {
  editionSchema,
  localizedTextSchema,
  setlistFileSchema,
  songFileSchema,
  vocaloidFileSchema,
} from './datasetSchema'
import { datasetSources, loadCatalog } from './loadCatalog'

/** パスから、そのファイルに当てるスキーマを選ぶ。 */
function schemaFor(path: string): z.ZodType {
  if (path.endsWith('/edition.yaml')) return editionSchema
  if (path.endsWith('/setlist.yaml')) return setlistFileSchema
  if (path.endsWith('/songs.yaml')) return songFileSchema
  return vocaloidFileSchema
}

const sources = Object.entries(datasetSources).sort(([a], [b]) => a.localeCompare(b))

describe('dataset の YAML', () => {
  test('すべて読み込める (グロブが空になっていない)', () => {
    expect(sources.length).toBeGreaterThan(0)
  })

  test.each(sources)('%s がスキーマに合う', (path, source) => {
    const parsed = parse(source)
    const result = schemaFor(path).safeParse(parsed)
    // prettifyError はどのキーがどう違うかを行で並べてくれる
    expect(result.success ? '' : z.prettifyError(result.error)).toBe('')
  })

  test('年ディレクトリの名前と edition.yaml の year が一致する', () => {
    const mismatches = sources
      .filter(([path]) => path.endsWith('/edition.yaml'))
      .map(([path, source]) => ({ path, year: (parse(source) as { year: number }).year }))
      .filter(({ path, year }) => path.split('/')[2] !== String(year))
      .map(({ path, year }) => `${path} の year が ${year}`)
    expect(mismatches).toEqual([])
  })
})

/**
 * カタログの組み立ては 1 回で足りるが、ここで即座に呼ぶと YAML が壊れているときに
 * 収集の段階で落ち、どのファイルが悪いのか分からないエラーになる。上のファイル別の
 * 検証を先に走らせたいので、最初に必要になったときまで遅らせる。
 */
let cached: Catalog | undefined
function catalogOf(): Catalog {
  cached ??= loadCatalog()
  return cached
}

describe('ファイルをまたいだ参照', () => {
  // loadCatalog は参照整合性 (曲名・公演とセットリストの対応) を自分で検証して
  // 落ちる。ここを通ることが「サイトが開ける」ことの最低条件になる。
  test('カタログを組み立てられる', () => {
    const catalog = catalogOf()
    expect(catalog.entries.length).toBeGreaterThan(0)
    expect(catalog.songs.size).toBeGreaterThan(0)
  })

  test('singers が vocaloids.yaml に存在する', () => {
    const catalog = catalogOf()
    const unknown: string[] = []
    for (const song of catalog.songs.values()) {
      for (const id of song.singers) {
        if (!catalog.vocaloids.has(id)) unknown.push(`songs.yaml の "${song.title}": ${id}`)
      }
    }
    for (const { edition, setlists } of catalog.entries) {
      for (const setlist of setlists) {
        for (const track of setlist.tracks) {
          for (const variant of track.variants) {
            for (const id of variant.singers ?? []) {
              if (!catalog.vocaloids.has(id)) {
                unknown.push(`${edition.slug} の ${track.order}曲目 "${variant.song}": ${id}`)
              }
            }
          }
        }
      }
    }
    expect(unknown).toEqual([])
  })

  test('候補が参照する公演回が edition.yaml に存在する', () => {
    const catalog = catalogOf()
    const dangling: string[] = []
    for (const { edition, setlists } of catalog.entries) {
      const shows = new Set(
        edition.performances.flatMap((performance) =>
          performance.shows.map((show) => `${performance.id}/${show.id}`),
        ),
      )
      for (const setlist of setlists) {
        for (const track of setlist.tracks) {
          for (const variant of track.variants) {
            for (const ref of variant.shows) {
              if (!shows.has(ref)) {
                dangling.push(
                  `${edition.slug} の ${track.order}曲目 "${variant.song}": ` +
                    `公演 ${performanceIdOf(ref)} に ${showIdOf(ref)} が無い`,
                )
              }
            }
          }
        }
      }
    }
    expect(dangling).toEqual([])
  })
})

test('スキーマのロケールが i18n の対応言語と揃っている', () => {
  expect(Object.keys(localizedTextSchema.shape).sort()).toEqual([...LOCALES].sort())
})
