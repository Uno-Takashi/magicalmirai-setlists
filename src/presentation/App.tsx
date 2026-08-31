import { useCallback, useMemo, useState } from 'react'
import { defaultEntry, findEntry } from '@/domain/catalog/Catalog'
import type { Song } from '@/domain/song/Song'
import { AboutDialog } from '@/presentation/components/AboutDialog'
import { AppFooter } from '@/presentation/components/AppFooter'
import { AppHeader } from '@/presentation/components/AppHeader'
import { EditionCarousel } from '@/presentation/components/EditionCarousel'
import { EditionSideNav } from '@/presentation/components/EditionSideNav'
import { SearchOverlay } from '@/presentation/components/SearchOverlay'
import { SongDialog } from '@/presentation/components/SongDialog'
import { RankingView } from '@/presentation/components/RankingView'
import { StatisticsView } from '@/presentation/components/StatisticsView'
import { VocaloidStatsView } from '@/presentation/components/VocaloidStatsView'
import { YearNavigator } from '@/presentation/components/YearNavigator'
import { useDocumentMeta } from '@/presentation/hooks/useDocumentMeta'
import { useKeyboardNavigation } from '@/presentation/hooks/useKeyboardNavigation'
import { useSearchShortcut } from '@/presentation/hooks/useSearchShortcut'
import {
  rankingPath,
  STATISTICS_PATH,
  useRoute,
  type RankingKind,
} from '@/presentation/hooks/useRoute'
import type { TranslationKey } from '@/infrastructure/i18n/i18n'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { localize } from '@/domain/vocaloid/Vocaloid'

/** 全体ランキングの各ページの見出し。meta の title にも使う。 */
const RANKING_TITLE_KEYS = {
  producers: 'statistics.producers.title',
  songs: 'statistics.songs.title',
  vocaloids: 'statistics.vocaloids.title',
} as const satisfies Record<RankingKind, TranslationKey>

export function App() {
  const { catalog } = useCatalog()
  const { t, locale } = useLocale()

  const fallbackSlug = defaultEntry(catalog)?.edition.slug ?? ''
  const [route, navigate] = useRoute(fallbackSlug)
  const onStatistics = route.kind === 'statistics' || route.kind === 'ranking'

  const entry =
    route.kind === 'edition' ? (findEntry(catalog, route.slug) ?? defaultEntry(catalog)) : undefined

  // ドメインは年代順(昇順)で持つ。表示は新しい年が先。
  const displayEntries = useMemo(() => [...catalog.entries].reverse(), [catalog.entries])
  const index = displayEntries.findIndex((e) => e.edition.slug === entry?.edition.slug)

  // 年送りの向き。切り替えアニメーションの方向に使う。
  // 描画中に読む値なので ref ではなく state で持つ。
  const [direction, setDirection] = useState(1)
  const go = useCallback(
    (nextIndex: number) => {
      const next = displayEntries[nextIndex]
      if (next === undefined) return
      setDirection(nextIndex > index ? 1 : -1)
      navigate(next.edition.slug)
    },
    [displayEntries, index, navigate],
  )

  // 表示順での前後。index-1 が新しい年、index+1 が古い年。統計ページでは効かせない。
  const goNewer = useCallback(() => {
    if (!onStatistics) go(index - 1)
  }, [go, index, onStatistics])
  const goOlder = useCallback(() => {
    if (!onStatistics) go(index + 1)
  }, [go, index, onStatistics])
  useKeyboardNavigation(goNewer, goOlder)

  /** 空文字ならホーム (base 直下) へ。統計ページからの復帰とタイトルのリンクに使う。 */
  const selectSlug = useCallback(
    (nextSlug: string) => {
      if (nextSlug === '' || onStatistics) {
        navigate(nextSlug)
        return
      }
      go(displayEntries.findIndex((e) => e.edition.slug === nextSlug))
    },
    [displayEntries, go, navigate, onStatistics],
  )

  // 年をたどって来たときに中央へ出す曲。1 度使ったら捨てる。
  const [focusSong, setFocusSong] = useState<string | null>(null)
  const clearFocusSong = useCallback(() => setFocusSong(null), [])
  const [searchOpen, setSearchOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)

  // 子へ渡すコールバックは同一性を保つ。描画のたびに新しい関数を渡すと、
  // 受け取り側の効果や memo がそのたびに無効になる。
  const openSearch = useCallback(() => setSearchOpen(true), [])
  useSearchShortcut(openSearch)
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const openAbout = useCallback(() => setAboutOpen(true), [])
  const closeAbout = useCallback(() => setAboutOpen(false), [])
  const closeSong = useCallback(() => setSelectedSong(null), [])
  const navigateHome = useCallback(() => selectSlug(''), [selectSlug])
  const openStatistics = useCallback(() => navigate(STATISTICS_PATH), [navigate])

  /** 曲の詳細から、その曲を演奏した年のセットリストへ移動する。 */
  const selectEditionFromSong = useCallback(
    (slug: string) => {
      // 遷移先の画面が見えるよう、重なっているモーダルと検索を閉じる
      setFocusSong(selectedSong?.title ?? null)
      setSelectedSong(null)
      setSearchOpen(false)
      selectSlug(slug)
    },
    [selectSlug, selectedSong],
  )

  // 検索結果に出る文言。静的ホスティングでは HTML が 1 種類しか無いので、
  // 現在地に応じた title / description はここで組み立てて反映する。
  const pageMeta = useMemo(() => {
    if (route.kind === 'ranking') {
      return {
        title: t(RANKING_TITLE_KEYS[route.ranking]),
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
    return {
      title: t('meta.editionTitle', { name }),
      description: t('meta.editionDescription', { name }),
      // ホームは既定の開催回を出すが、正規 URL は base 直下にまとめる。
      path: entry.edition.slug === fallbackSlug ? '' : entry.edition.slug,
    }
  }, [entry, fallbackSlug, locale, route, t])

  useDocumentMeta({ siteName: t('app.title'), ...pageMeta })

  const overlays = (
    <>
      <SearchOverlay
        open={searchOpen}
        onClose={closeSearch}
        onSelectSong={setSelectedSong}
        onSelectEdition={selectSlug}
      />
      <SongDialog song={selectedSong} onClose={closeSong} onSelectEdition={selectEditionFromSong} />
      <AboutDialog open={aboutOpen} onClose={closeAbout} />
    </>
  )

  const header = (
    <AppHeader
      onNavigateHome={navigateHome}
      onOpenSearch={openSearch}
      onOpenStatistics={openStatistics}
      onOpenAbout={openAbout}
    />
  )

  if (onStatistics) {
    return (
      <div className="flex min-h-full flex-col">
        {header}
        <main className="flex-1">
          {route.kind === 'ranking' && route.ranking === 'vocaloids' ? (
            <VocaloidStatsView />
          ) : route.kind === 'ranking' ? (
            <RankingView ranking={route.ranking} onSelectSong={setSelectedSong} />
          ) : (
            <StatisticsView
              onShowAll={(ranking) => navigate(rankingPath(ranking))}
              onSelectSong={setSelectedSong}
            />
          )}
        </main>
        <AppFooter />
        {overlays}
      </div>
    )
  }

  if (entry === undefined) {
    return (
      <main className="grid min-h-full place-items-center p-8 text-center">
        <p className="text-muted text-sm">{t('edition.noSetlist')}</p>
      </main>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      {header}

      <YearNavigator
        entries={displayEntries}
        currentSlug={entry.edition.slug}
        onSelect={selectSlug}
        onNewer={goNewer}
        onOlder={goOlder}
      />

      <main className="flex flex-1 flex-col">
        <EditionCarousel
          entry={entry}
          direction={direction}
          canGoNewer={index > 0}
          canGoOlder={index < displayEntries.length - 1}
          onNewer={goNewer}
          onOlder={goOlder}
          focusSong={focusSong}
          onSelectSong={setSelectedSong}
          onFocusHandled={clearFocusSong}
        />
      </main>

      <AppFooter />

      <EditionSideNav
        canGoNewer={index > 0}
        canGoOlder={index < displayEntries.length - 1}
        onNewer={goNewer}
        onOlder={goOlder}
      />

      {overlays}
    </div>
  )
}
