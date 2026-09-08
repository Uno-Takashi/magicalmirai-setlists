/**
 * サイトが持つページの一覧と、ページごとの検索向けの情報。
 *
 * **ビルド時にだけ使う。** 配信するバンドルには入らない。
 * `sitemap.xml` と、ページごとの HTML (prerender.ts) の両方がここを見る。
 * 2 か所で URL の並びがずれないよう、ページの定義はここ 1 か所に置く。
 *
 * 文言は `src/infrastructure/i18n/locales/ja.ts` から取る。画面と検索結果で
 * 言い回しがずれないようにするため、ここに書き写さない。
 */

import fs from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { ja } from '../src/infrastructure/i18n/locales/ja.ts'

/** 統計のページ。`useRoute.ts` の STATISTICS_PATH / RANKINGS と揃える。 */
const STATISTICS_PATH = 'statics'
const RANKINGS = ['producers', 'songs', 'vocaloids'] as const

/** ランキングのページの見出し。`usePageMeta.ts` の RANKING_TITLE_KEYS と揃える。 */
const RANKING_TITLE_KEYS = {
  producers: 'statistics.producers.title',
  songs: 'statistics.songs.title',
  vocaloids: 'statistics.vocaloids.title',
} as const satisfies Record<(typeof RANKINGS)[number], keyof typeof ja>

/** `{name}` を差し込む。i18n の createTranslate と同じ規則。 */
function t(key: keyof typeof ja, params: Record<string, string> = {}): string {
  return ja[key].replace(/\{(\w+)\}/g, (match, name: string) => params[name] ?? match)
}

/** dataset/<年>/edition.yaml から読む、ページを組み立てるのに要るところだけ。 */
interface RawEdition {
  year: number
  slug: string
  name: { ja: string; [locale: string]: string | undefined }
  officialUrl?: string
  performances?: {
    city?: { ja: string }
    venue?: { ja: string }
    shows?: { date: string }[]
  }[]
}

export interface EditionSummary {
  readonly slug: string
  readonly year: number
  readonly name: string
  readonly officialUrl?: string
  /** 最初と最後の開催日 (YYYY-MM-DD)。日程が未発表なら undefined。 */
  readonly from?: string
  readonly to?: string
  /** 会場。「インテックス大阪 (大阪)」の形で並べる。 */
  readonly venues: readonly { venue: string; city: string }[]
}

/**
 * dataset から開催回を読む。**年 (ディレクトリ名) の降順**で返す。
 *
 * 新しい年ほど見られるので、sitemap でも先に並べる。
 */
export function readEditions(datasetDir: string): EditionSummary[] {
  return fs
    .readdirSync(datasetDir)
    .filter((entry) => /^\d+$/.test(entry))
    .map((entry) => {
      const file = path.join(datasetDir, entry, 'edition.yaml')
      const doc = parseYaml(fs.readFileSync(file, 'utf8')) as RawEdition
      const dates = (doc.performances ?? [])
        .flatMap((performance) => performance.shows ?? [])
        .map((show) => show.date)
        .sort()
      const venues = (doc.performances ?? []).flatMap((performance) =>
        performance.venue === undefined || performance.city === undefined
          ? []
          : [{ venue: performance.venue.ja, city: performance.city.ja }],
      )

      return {
        slug: doc.slug,
        year: doc.year,
        name: doc.name.ja,
        officialUrl: doc.officialUrl,
        from: dates[0],
        to: dates[dates.length - 1],
        venues,
      }
    })
    .sort((a, b) => b.year - a.year)
}

export interface PageMeta {
  /** 公開 URL の、サイトの入口からの相対パス (先頭スラッシュなし)。ホームは ''。 */
  readonly path: string
  /** ページ固有の見出し。省略するとサイト名だけになる (ホーム)。 */
  readonly title?: string
  readonly description: string
  /** そのページに置く構造化データ。 */
  readonly jsonLd: readonly object[]
}

/** 絶対 URL にする。siteUrl は末尾スラッシュを含む。 */
function urlOf(siteUrl: string, pagePath: string): string {
  return `${siteUrl}${pagePath}`
}

/**
 * パンくず。検索結果にページの階層が出る。
 *
 * ホームは階層を持たないので作らない (1 段だけのパンくずは意味がない)。
 */
function breadcrumb(
  siteUrl: string,
  trail: readonly { name: string; path: string }[],
): object | undefined {
  if (trail.length === 0) return undefined
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: t('app.title'), path: '' }, ...trail].map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: urlOf(siteUrl, item.path),
    })),
  }
}

/**
 * 開催回のページの構造化データ。
 *
 * **ページそのものを MusicEvent にはしない。** ここは公演を主催する側のページでは
 * なく、公演について書いたページなので、`WebPage` の `about` に置く。
 * 公演の公式な案内は `officialUrl` の方だと示すため、`url` はそちらへ向ける。
 */
function editionJsonLd(siteUrl: string, edition: EditionSummary): object {
  const event: Record<string, unknown> = {
    '@type': 'MusicEvent',
    name: edition.name,
    performer: { '@type': 'MusicGroup', name: '初音ミク' },
  }
  if (edition.from !== undefined) event.startDate = edition.from
  if (edition.to !== undefined) event.endDate = edition.to
  if (edition.officialUrl !== undefined) event.url = edition.officialUrl
  if (edition.venues.length > 0) {
    event.location = edition.venues.map(({ venue, city }) => ({
      '@type': 'Place',
      name: venue,
      address: { '@type': 'PostalAddress', addressLocality: city, addressCountry: 'JP' },
    }))
  }

  return {
    '@type': 'WebPage',
    '@id': `${urlOf(siteUrl, edition.slug)}#webpage`,
    url: urlOf(siteUrl, edition.slug),
    name: t('meta.editionTitle', { name: edition.name }),
    description: t('meta.editionDescription', { name: edition.name }),
    inLanguage: 'ja',
    isPartOf: { '@id': `${siteUrl}#website` },
    about: event,
  }
}

/** 統計まわりのページの構造化データ。曲やボカロ P を集めた一覧なので CollectionPage。 */
function collectionJsonLd(siteUrl: string, pagePath: string, name: string): object {
  return {
    '@type': 'CollectionPage',
    '@id': `${urlOf(siteUrl, pagePath)}#webpage`,
    url: urlOf(siteUrl, pagePath),
    name,
    description: t('statistics.description'),
    inLanguage: 'ja',
    isPartOf: { '@id': `${siteUrl}#website` },
  }
}

/** 構造化データを 1 つの配列にまとめる (undefined は落とす)。 */
function jsonLdOf(...items: (object | undefined)[]): object[] {
  return items.filter((item): item is object => item !== undefined)
}

/**
 * サイトの全ページ。sitemap の並び順でもある。
 *
 * ホームは既定の開催回を映すが、正規 URL はサイトの入口 (`''`) の方にまとめる。
 * 同じ内容が 2 つの URL で indexed されないよう、開催回のページ側は自分の slug を
 * canonical に持つ。
 */
export function sitePages(siteUrl: string, editions: readonly EditionSummary[]): PageMeta[] {
  const statisticsTrail = { name: t('statistics.title'), path: STATISTICS_PATH }

  return [
    {
      path: '',
      description: ja['app.description'],
      jsonLd: [],
    },
    ...editions.map((edition) => ({
      path: edition.slug,
      title: t('meta.editionTitle', { name: edition.name }),
      description: t('meta.editionDescription', { name: edition.name }),
      jsonLd: jsonLdOf(
        editionJsonLd(siteUrl, edition),
        breadcrumb(siteUrl, [
          { name: t('meta.editionTitle', { name: edition.name }), path: edition.slug },
        ]),
      ),
    })),
    {
      path: STATISTICS_PATH,
      title: t('statistics.title'),
      description: ja['statistics.description'],
      jsonLd: jsonLdOf(
        collectionJsonLd(siteUrl, STATISTICS_PATH, t('statistics.title')),
        breadcrumb(siteUrl, [statisticsTrail]),
      ),
    },
    ...RANKINGS.map((ranking) => {
      const name = ja[RANKING_TITLE_KEYS[ranking]]
      const pagePath = `${STATISTICS_PATH}/${ranking}`
      return {
        path: pagePath,
        title: name,
        description: ja['statistics.description'],
        jsonLd: jsonLdOf(
          collectionJsonLd(siteUrl, pagePath, name),
          breadcrumb(siteUrl, [statisticsTrail, { name, path: pagePath }]),
        ),
      }
    }),
  ]
}
