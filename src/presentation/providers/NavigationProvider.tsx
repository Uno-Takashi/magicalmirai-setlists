import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { defaultEntry, findEntry } from '@/domain/catalog/Catalog'
import type { SongTitle } from '@/domain/song/Song'
import { rankingPath, STATISTICS_PATH, type RankingKind } from '@/presentation/routing/routes'
import { useRoute } from '@/presentation/routing/useRoute'
import { useCatalog } from './CatalogContext'
import { NavigationContext, type NavigationContextValue } from './NavigationContext'

export function NavigationProvider({ children }: { children: ReactNode }) {
  const { catalog } = useCatalog()

  /** 既定で見せる開催回。ホームと、知らない slug の受け皿。 */
  const fallback = defaultEntry(catalog)
  const [route, navigate] = useRoute(fallback?.edition.slug ?? '')
  const onStatistics = route.kind !== 'edition'

  const entries = useMemo(() => catalog.entries.toReversed(), [catalog.entries])
  const entry = route.kind === 'edition' ? (findEntry(catalog, route.slug) ?? fallback) : undefined
  const index = entry === undefined ? -1 : entries.indexOf(entry)

  // 切り替えアニメーションの向き。描画中に読む値なので ref ではなく state で持つ。
  const [direction, setDirection] = useState(1)
  const [focusSong, setFocusSong] = useState<SongTitle | null>(null)

  const go = useCallback(
    (nextIndex: number) => {
      const next = entries[nextIndex]
      if (next === undefined) return
      setDirection(nextIndex > index ? 1 : -1)
      navigate(next.edition.slug)
    },
    [entries, index, navigate],
  )

  // 表示順での前後。index-1 が新しい年、index+1 が古い年。統計ページでは効かせない。
  const goNewer = useCallback(() => {
    if (!onStatistics) go(index - 1)
  }, [go, index, onStatistics])
  const goOlder = useCallback(() => {
    if (!onStatistics) go(index + 1)
  }, [go, index, onStatistics])

  const selectEdition = useCallback(
    (slug: string) => {
      // ホームへ戻るときと統計から出るときは、送りの向きを決められないので素直に移る
      if (slug === '' || onStatistics) {
        navigate(slug)
        return
      }
      go(entries.findIndex((e) => e.edition.slug === slug))
    },
    [entries, go, navigate, onStatistics],
  )

  const openStatistics = useCallback(() => navigate(STATISTICS_PATH), [navigate])
  const openRanking = useCallback((kind: RankingKind) => navigate(rankingPath(kind)), [navigate])

  const clearFocusSong = useCallback(() => setFocusSong(null), [])
  const showSongInEdition = useCallback(
    (slug: string, title: SongTitle) => {
      setFocusSong(title)
      selectEdition(slug)
    },
    [selectEdition],
  )

  const value = useMemo<NavigationContextValue>(
    () => ({
      route,
      entries,
      entry,
      direction,
      canGoNewer: index > 0,
      canGoOlder: index >= 0 && index < entries.length - 1,
      goNewer,
      goOlder,
      selectEdition,
      openStatistics,
      openRanking,
      focusSong,
      clearFocusSong,
      showSongInEdition,
    }),
    [
      route,
      entries,
      entry,
      index,
      direction,
      goNewer,
      goOlder,
      selectEdition,
      openStatistics,
      openRanking,
      focusSong,
      clearFocusSong,
      showSongInEdition,
    ],
  )

  return <NavigationContext value={value}>{children}</NavigationContext>
}
