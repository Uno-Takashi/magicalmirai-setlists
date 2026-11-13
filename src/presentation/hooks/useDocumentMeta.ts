/**
 * title / description / canonical / OGP を書き換える。
 *
 * ページごとの HTML はビルド時に日本語で書き出している (`build/renderPage.ts`)。
 * ここは描画後に、表示中の言語と現在地に合わせてそれを差し替える。
 * 年送りのように URL が描画中に変わる移動にも追従させるため。
 */

import { useEffect } from 'react'

export interface DocumentMeta {
  /** ページ固有の見出し。省略するとサイト名だけになる。 */
  readonly title?: string
  readonly description: string
  /** base からの相対パス (先頭スラッシュなし)。 */
  readonly path: string
}

/** 公開 URL。.env の VITE_SITE_URL。末尾のスラッシュを含む。 */
const SITE_URL = import.meta.env.VITE_SITE_URL

function setAttribute(selector: string, attribute: string, value: string): void {
  document.head.querySelector(selector)?.setAttribute(attribute, value)
}

export function useDocumentMeta({
  siteName,
  title,
  description,
  path,
}: DocumentMeta & { siteName: string }): void {
  useEffect(() => {
    // build/renderPage.ts の renderPage と同じ組み立て方にする
    const fullTitle = title === undefined ? siteName : `${title} | ${siteName}`
    const url = `${SITE_URL}${path}`

    document.title = fullTitle
    setAttribute('meta[name="description"]', 'content', description)
    setAttribute('link[rel="canonical"]', 'href', url)
    setAttribute('meta[property="og:title"]', 'content', fullTitle)
    setAttribute('meta[property="og:description"]', 'content', description)
    setAttribute('meta[property="og:url"]', 'content', url)
    setAttribute('meta[property="og:site_name"]', 'content', siteName)
    setAttribute('meta[name="twitter:title"]', 'content', fullTitle)
    setAttribute('meta[name="twitter:description"]', 'content', description)
  }, [siteName, title, description, path])
}
