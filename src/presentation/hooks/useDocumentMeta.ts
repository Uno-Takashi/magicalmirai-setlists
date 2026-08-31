/**
 * ページごとの title / description / canonical を書き換える。
 *
 * 静的ホスティングではどの URL も同じ index.html (404.html) が返るため、
 * HTML に埋め込んだ meta はサイト全体の既定値にしかならない。
 * 実際のページに応じた文言はここで描画後に差し替える。
 */

import { useEffect } from 'react'

export type DocumentMeta = {
  /** ページ固有の見出し。省略するとサイト名だけになる。 */
  title?: string
  description: string
  /** base からの相対パス (先頭スラッシュなし)。 */
  path: string
}

/** 公開 URL。.env の VITE_SITE_URL。末尾のスラッシュを含む。 */
const SITE_URL = import.meta.env.VITE_SITE_URL

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.head.querySelector(selector)
  if (element !== null) element.setAttribute(attribute, value)
}

export function useDocumentMeta({
  siteName,
  title,
  description,
  path,
}: DocumentMeta & {
  siteName: string
}) {
  useEffect(() => {
    const fullTitle = title === undefined ? siteName : `${title} | ${siteName}`
    const url = `${SITE_URL}${path}`

    document.title = fullTitle
    setMeta('meta[name="description"]', 'content', description)
    setMeta('link[rel="canonical"]', 'href', url)
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('meta[property="og:site_name"]', 'content', siteName)
    setMeta('meta[name="twitter:title"]', 'content', fullTitle)
    setMeta('meta[name="twitter:description"]', 'content', description)
  }, [siteName, title, description, path])
}
