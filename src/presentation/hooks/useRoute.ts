/**
 * History API によるパスルーティング。
 *
 *   <base>statics    統計ページ
 *   <base><slug>     その開催回のページ
 *   <base>           既定の開催回
 *
 * 静的ホスティングでは実体ファイルが無いパスは 404 になるため、
 * ビルド時に index.html を 404.html にも複製している (vite.config.ts)。
 */

import { useMemo, useSyncExternalStore } from 'react'

export const STATISTICS_PATH = 'statics'

/** 統計ページの中の、全体ランキングのページ。 */
export const RANKINGS = ['producers', 'songs', 'vocaloids'] as const
export type RankingKind = (typeof RANKINGS)[number]

export function rankingPath(kind: RankingKind): string {
  return `${STATISTICS_PATH}/${kind}`
}

/** Vite の base ('/setlist/' など)。末尾スラッシュを含む。 */
const BASE = import.meta.env.BASE_URL

/** ホーム (base 直下)。既定の開催回が表示される。 */
export const HOME_URL = BASE

export type Route =
  | { kind: 'edition'; slug: string }
  | { kind: 'statistics' }
  | { kind: 'ranking'; ranking: RankingKind }

/** 現在の URL から base を取り除いた部分を返す。 */
function readPath(): string {
  const { pathname } = window.location
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, '')
  return decodeURIComponent(rest.replace(/\/$/, ''))
}

function toRoute(path: string, fallbackSlug: string): Route {
  if (path === STATISTICS_PATH) return { kind: 'statistics' }
  const [head, tail] = path.split('/')
  if (head === STATISTICS_PATH && tail !== undefined) {
    const ranking = RANKINGS.find((r) => r === tail)
    if (ranking !== undefined) return { kind: 'ranking', ranking }
    return { kind: 'statistics' }
  }
  return { kind: 'edition', slug: path === '' ? fallbackSlug : path }
}

/**
 * 現在地は history が持つ「外部の状態」なので、React 側に写しを置かず
 * useSyncExternalStore で購読する。pushState はイベントを起こさないため、
 * navigate から購読者へ自分で通知する。
 */
const listeners = new Set<() => void>()

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange)
  window.addEventListener('popstate', onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
    window.removeEventListener('popstate', onStoreChange)
  }
}

/**
 * base 配下へ遷移する。'statics/producers' のように階層を持つので、
 * セグメントごとにエスケープする。
 */
export function navigate(next: string): void {
  const url = BASE + next.split('/').map(encodeURIComponent).join('/')
  if (url === window.location.pathname) return
  window.history.pushState(null, '', url)
  for (const listener of [...listeners]) listener()
}

export function useRoute(fallbackSlug: string): [Route, (path: string) => void] {
  const path = useSyncExternalStore(subscribe, readPath)
  const route = useMemo(() => toRoute(path, fallbackSlug), [path, fallbackSlug])
  return [route, navigate]
}
