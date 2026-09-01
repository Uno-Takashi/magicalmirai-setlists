import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import { defaultEntry, findEntry, type EditionEntry } from '@/domain/catalog/Catalog'
import type { SongTitle } from '@/domain/song/Song'
import {
  rankingPath,
  STATISTICS_PATH,
  useRoute,
  type RankingKind,
  type Route,
} from '@/presentation/hooks/useRoute'
import { useCatalog } from '@/presentation/providers/CatalogProvider'

/**
 * 「いま画面のどこを見ているか」をまとめて持つ。
 *
 * 現在地は URL (history) が正で、`useRoute` がそれを写す。ここはその上に
 * 「開催回を 1 つ送る」「曲を出しながら年へ移る」といった、この画面ならではの
 * 動き方を足したもの。ヘッダー・年タブ・左右の矢印・統計・曲の詳細と、
 * 現在地を触る場所が画面のあちこちに散っているので、props ではなく文脈で配る。
 */
interface NavigationValue {
  readonly route: Route
  /** 表示順 (新しい年が先) の開催回。ドメインは年代順で持つのでここで反転する。 */
  readonly entries: readonly EditionEntry[]
  /** いま見ている開催回。統計のページでは undefined。 */
  readonly entry: EditionEntry | undefined
  /** `entries` の中での位置。見つからなければ -1。 */
  readonly index: number
  /** 年送りの向き。表示順で後ろへ動いたら 1、前へ動いたら -1。 */
  readonly direction: number
  readonly canGoNewer: boolean
  readonly canGoOlder: boolean
  goNewer: () => void
  goOlder: () => void
  /** 開催回へ移る。空文字ならホーム (base 直下)。 */
  selectEdition: (slug: string) => void
  openStatistics: () => void
  openRanking: (kind: RankingKind) => void
  /** 年をたどって来たときに中央へ出す曲。1 度使ったら捨てる。 */
  readonly focusSong: SongTitle | null
  clearFocusSong: () => void
  /** その曲を演奏した年へ移り、着いた先でその曲まで送る。 */
  showSongInEdition: (slug: string, title: SongTitle) => void
}

const NavigationContext = createContext<NavigationValue | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const { catalog } = useCatalog()

  /** 既定で見せる開催回。ホームと、知らない slug の受け皿。 */
  const fallback = defaultEntry(catalog)
  const [route, navigate] = useRoute(fallback?.edition.slug ?? '')
  const onStatistics = route.kind === 'statistics' || route.kind === 'ranking'

  const entries = useMemo(() => [...catalog.entries].reverse(), [catalog.entries])
  const entry = route.kind === 'edition' ? (findEntry(catalog, route.slug) ?? fallback) : undefined
  const index = entries.findIndex((e) => e.edition.slug === entry?.edition.slug)

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

  const value = useMemo<NavigationValue>(
    () => ({
      route,
      entries,
      entry,
      index,
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

export function useNavigation(): NavigationValue {
  const value = use(NavigationContext)
  if (value === null) throw new Error('NavigationProvider の外で useNavigation を呼び出しています')
  return value
}
