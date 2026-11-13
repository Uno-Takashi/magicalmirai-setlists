/**
 * History API による現在地の購読と遷移。URL の形そのものは `routes.ts` が決める。
 *
 * ページはビルド時に URL ごとの HTML として書き出している (vite.config.ts の
 * `prerenderPages`) ので、どの URL から入ってもこのアプリが起動する。
 */

import { useMemo, useSyncExternalStore } from 'react'
import { parseRoute, type Route } from './routes'

/** Vite の base ('/setlist/' など)。末尾スラッシュを含む。 */
const BASE = import.meta.env.BASE_URL

/** ホーム (base 直下)。既定の開催回が表示される。 */
export const HOME_URL = BASE

/** 現在の URL から base と末尾のスラッシュを取り除いた部分を返す。 */
function readPath(): string {
  const { pathname } = window.location
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, '')
  return decodeURIComponent(rest.replace(/\/$/, ''))
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
function navigate(next: string): void {
  const url = BASE + next.split('/').map(encodeURIComponent).join('/')
  if (url === window.location.pathname) return
  window.history.pushState(null, '', url)
  for (const listener of [...listeners]) listener()
}

export function useRoute(fallbackSlug: string): [Route, (path: string) => void] {
  const path = useSyncExternalStore(subscribe, readPath)
  const route = useMemo(() => parseRoute(path, fallbackSlug), [path, fallbackSlug])
  return [route, navigate]
}
