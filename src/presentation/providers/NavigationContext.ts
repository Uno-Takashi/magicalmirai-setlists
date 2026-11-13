import { createContext } from 'react'
import type { EditionEntry } from '@/domain/catalog/Catalog'
import type { SongTitle } from '@/domain/song/Song'
import type { RankingKind, Route } from '@/presentation/routing/routes'
import { useRequiredContext } from './requiredContext'

/**
 * 「いま画面のどこを見ているか」をまとめて持つ。
 *
 * 現在地は URL (history) が正で、`useRoute` がそれを写す。ここはその上に
 * 「開催回を 1 つ送る」「曲を出しながら年へ移る」といった、この画面ならではの
 * 動き方を足したもの。ヘッダー・年タブ・左右の矢印・統計・曲の詳細と、
 * 現在地を触る場所が画面のあちこちに散っているので、props ではなく文脈で配る。
 */
export interface NavigationContextValue {
  readonly route: Route
  /** 表示順 (新しい年が先) の開催回。ドメインは年代順で持つのでここで反転する。 */
  readonly entries: readonly EditionEntry[]
  /** いま見ている開催回。統計のページでは undefined。 */
  readonly entry: EditionEntry | undefined
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

export const NavigationContext = createContext<NavigationContextValue | null>(null)

export function useNavigation(): NavigationContextValue {
  return useRequiredContext(NavigationContext, 'useNavigation')
}
