/**
 * ページごとの HTML を作る。
 *
 * **なぜ要るか。** 静的ホスティングは実体の無いパスに 404 を返す。これまでは
 * `index.html` を `404.html` に複製することでディープリンクを動かしていたが、
 * その応答は **404 のまま**なので、検索エンジンからはサイトの入口以外どのページも
 * 存在しないことになっていた (sitemap に載せた URL がすべて 404 だった)。
 *
 * ビルド時にページごとの実体を書き出すと、200 で返るようになり、あわせて
 * JavaScript を実行しない収集器 (SNS のカード生成など) にもそのページの
 * title / description / OGP が届く。
 *
 * 中身 (`<div id="root">`) は空のまま。アプリは今までどおりブラウザ側で描く。
 */

import type { PageMeta } from './pageMeta.ts'

/** 属性値や本文に置く文字列を安全にする。 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * `<title>` を差し替える。
 *
 * 見つからなければ何もしない。テンプレート側から消えたときに、
 * 黙って壊れた HTML を書き出さないようにする。
 */
function replaceTitle(html: string, title: string): string {
  return html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
}

/**
 * `<meta name="..." content="...">` の content を差し替える。
 *
 * 属性の並びは index.html を整形した結果に左右されるので、名前を先に見つけてから
 * その要素の中の content だけを書き換える。
 */
function replaceMeta(html: string, attribute: 'name' | 'property', key: string, value: string) {
  const pattern = new RegExp(`(<meta\\s+[^>]*${attribute}="${key}"[^>]*>)`)
  return html.replace(pattern, (tag) =>
    tag.replace(/content="[^"]*"/, `content="${escapeHtml(value)}"`),
  )
}

/** `<link rel="canonical" href="...">` を差し替える。 */
function replaceCanonical(html: string, url: string): string {
  return html.replace(/(<link\s+[^>]*rel="canonical"[^>]*>)/, (tag) =>
    tag.replace(/href="[^"]*"/, `href="${escapeHtml(url)}"`),
  )
}

/**
 * 構造化データを `</head>` の直前に足す。
 *
 * `<` を退避するのは、値の中に `</script>` が現れるとそこで script が閉じてしまうため。
 */
function appendJsonLd(html: string, blocks: readonly object[]): string {
  if (blocks.length === 0) return html

  const scripts = blocks
    .map((block) => {
      const body = JSON.stringify({ '@context': 'https://schema.org', ...block }).replace(
        /</g,
        '\\u003c',
      )
      return `    <script type="application/ld+json">${body}</script>`
    })
    .join('\n')

  return html.replace('</head>', `${scripts}\n  </head>`)
}

/**
 * 1 ページ分の HTML を作る。
 *
 * `template` はビルド済みの index.html。資産への参照 (ハッシュ付き) がすでに
 * 入っているので、そのまま使い回して head の文言だけを入れ替える。
 */
export function renderPage(
  template: string,
  page: PageMeta,
  { siteUrl, siteName }: { siteUrl: string; siteName: string },
): string {
  const fullTitle = page.title === undefined ? siteName : `${page.title} | ${siteName}`
  const url = `${siteUrl}${page.path}`

  let html = replaceTitle(template, fullTitle)
  html = replaceMeta(html, 'name', 'description', page.description)
  html = replaceCanonical(html, url)
  html = replaceMeta(html, 'property', 'og:title', fullTitle)
  html = replaceMeta(html, 'property', 'og:description', page.description)
  html = replaceMeta(html, 'property', 'og:url', url)
  html = replaceMeta(html, 'name', 'twitter:title', fullTitle)
  html = replaceMeta(html, 'name', 'twitter:description', page.description)
  return appendJsonLd(html, page.jsonLd)
}

/**
 * 見つからなかったときの HTML。
 *
 * ここは実在しない URL に返るページなので、検索結果に載せない。
 * 中身はアプリを起動する index.html のままにして、打ち間違いや古いリンクから来た人が
 * そのままサイトを使えるようにする。
 *
 * **canonical は消す。** 残すとどの誤った URL もサイトの入口と同じページだと
 * 申告することになり、打ち間違いの URL がホームの別名として扱われかねない。
 */
export function renderNotFound(template: string): string {
  const html = replaceMeta(replaceTitle(template, '404'), 'name', 'robots', 'noindex, follow')
  return html.replace(/\s*<link\s+[^>]*rel="canonical"[^>]*>/, '')
}
