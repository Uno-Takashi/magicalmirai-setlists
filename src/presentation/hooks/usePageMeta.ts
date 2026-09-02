/**
 * 現在地から、検索結果に出る文言 (title / description / canonical) を決める。
 *
 * 静的ホスティングでは HTML が 1 種類しか無いので、HTML に埋めた meta は
 * サイト全体の既定値にしかならない。ページごとの文言はここで組み立てて、
 * `useDocumentMeta` が描画後に差し替える。
 */

import { useMemo } from 'react'
import { defaultEntry } from '@/domain/catalog/Catalog'
import { localize } from '@/domain/vocaloid/Vocaloid'
import type { TranslationKey } from '@/infrastructure/i18n/i18n'
import { useDocumentMeta, type DocumentMeta } from '@/presentation/hooks/useDocumentMeta'
import { rankingPath, STATISTICS_PATH, type RankingKind } from '@/presentation/hooks/useRoute'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { useNavigation } from '@/presentation/providers/NavigationProvider'

/** 全体ランキングの各ページの見出し。画面の見出しと meta の title に使う。 */
const RANKING_TITLE_KEYS = {
  producers: 'statistics.producers.title',
  songs: 'statistics.songs.title',
  vocaloids: 'statistics.vocaloids.title',
} as const satisfies Record<RankingKind, TranslationKey>

export function rankingTitleKey(kind: RankingKind): TranslationKey {
  return RANKING_TITLE_KEYS[kind]
}

/** 現在地に合わせて、ページの meta を書き換える。 */
export function usePageMeta(): void {
  const { catalog } = useCatalog()
  const { route, entry } = useNavigation()
  const { t, locale } = useLocale()
  const homeSlug = defaultEntry(catalog)?.edition.slug ?? ''

  const meta = useMemo<DocumentMeta>(() => {
    if (route.kind === 'ranking') {
      return {
        title: t(rankingTitleKey(route.ranking)),
        description: t('statistics.description'),
        path: rankingPath(route.ranking),
      }
    }
    if (route.kind === 'statistics') {
      return {
        title: t('statistics.title'),
        description: t('statistics.description'),
        path: STATISTICS_PATH,
      }
    }
    if (entry === undefined) {
      return { description: t('app.description'), path: '' }
    }

    const name = localize(entry.edition.name, locale)
    // ホームは既定の開催回を出すが、正規 URL は base 直下にまとめる。
    // その URL はサイトの入口でもあるので、title には開催回を入れずサイト名だけにする。
    const isHome = entry.edition.slug === homeSlug
    return {
      title: isHome ? undefined : t('meta.editionTitle', { name }),
      description: t('meta.editionDescription', { name }),
      path: isHome ? '' : entry.edition.slug,
    }
  }, [entry, homeSlug, locale, route, t])

  useDocumentMeta({ siteName: t('app.title'), ...meta })
}
