/**
 * 現在地から、検索結果に出る文言 (title / description / canonical) を決める。
 *
 * ビルド時に書き出す HTML (`build/pageMeta.ts`) と同じ文言になるように組み立てる。
 * 違うのは言語だけで、あちらは日本語に固定、こちらは表示中の言語に合わせる。
 */

import { useMemo } from 'react'
import { defaultEntry } from '@/domain/catalog/Catalog'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { useDocumentMeta, type DocumentMeta } from '@/presentation/hooks/useDocumentMeta'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { useNavigation } from '@/presentation/providers/NavigationProvider'
import { RANKING_TITLE_KEYS, rankingPath, STATISTICS_PATH } from '@/presentation/routing/routes'

/** 現在地に合わせて、ページの meta を書き換える。 */
export function usePageMeta(): void {
  const { catalog } = useCatalog()
  const { route, entry } = useNavigation()
  const { t, locale } = useLocale()
  const homeSlug = defaultEntry(catalog)?.edition.slug

  const meta = useMemo<DocumentMeta>(() => {
    switch (route.kind) {
      case 'ranking':
        return {
          title: t(RANKING_TITLE_KEYS[route.ranking]),
          description: t('statistics.description'),
          path: rankingPath(route.ranking),
        }
      case 'statistics':
        return {
          title: t('statistics.title'),
          description: t('statistics.description'),
          path: STATISTICS_PATH,
        }
      case 'edition':
        break
    }

    // ホームは既定の開催回を出すが、正規 URL は base 直下にまとめる。
    // 説明もサイト全体のものにする。既定の開催回の説明にすると、年が変わるたびに
    // 入口の説明文が変わってしまい、サイトが何であるかを説明しなくなる。
    if (entry === undefined || entry.edition.slug === homeSlug) {
      return { description: t('app.description'), path: '' }
    }

    const name = localize(entry.edition.name, locale)
    return {
      title: t('meta.editionTitle', { name }),
      description: t('meta.editionDescription', { name }),
      path: entry.edition.slug,
    }
  }, [entry, homeSlug, locale, route, t])

  useDocumentMeta({ siteName: t('app.title'), ...meta })
}
