/**
 * ページごとの HTML の組み立て。
 *
 * ここが壊れると、全ページが同じ文言のまま配信される (しかも気付きにくい。
 * ブラウザで開くとアプリが描画後に書き換えるので、人の目には正しく見えてしまう)。
 * 差し替えの成否は文字列で確かめる。
 */

import { describe, expect, it } from 'vitest'
import type { PageMeta } from './pageMeta.ts'
import { renderNotFound, renderPage } from './renderPage.ts'

/** ビルド済み index.html を模したテンプレート。属性の並びや改行も本物に寄せる。 */
const TEMPLATE = `<!doctype html>
<html lang="ja">
  <head>
    <title>サイト名</title>
    <meta
      name="description"
      content="サイトの説明"
    />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="https://example.test/" />
    <meta property="og:title" content="サイト名" />
    <meta property="og:description" content="サイトの説明" />
    <meta property="og:url" content="https://example.test/" />
    <meta name="twitter:title" content="サイト名" />
    <meta name="twitter:description" content="サイトの説明" />
    <script type="application/ld+json">{"@type":"WebSite"}</script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index-abc123.js"></script>
  </body>
</html>
`

const OPTIONS = { siteUrl: 'https://example.test/', siteName: 'サイト名' }

function page(overrides: Partial<PageMeta> = {}): PageMeta {
  return {
    path: '2023',
    title: '2023 セットリスト',
    description: '2023 の説明',
    jsonLd: [],
    ...overrides,
  }
}

/** 属性を 1 つ取り出す。改行をまたぐ meta もあるので空白は潰して比べる。 */
function attr(html: string, pattern: RegExp): string | undefined {
  return html.match(pattern)?.[1]?.replace(/\s+/g, ' ').trim()
}

const TITLE = /<title>([\s\S]*?)<\/title>/
const DESCRIPTION = /<meta[^>]*name="description"[^>]*content="([^"]*)"/
const CANONICAL = /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/
const ROBOTS = /<meta[^>]*name="robots"[^>]*content="([^"]*)"/
const OG_TITLE = /<meta[^>]*property="og:title"[^>]*content="([^"]*)"/
const OG_URL = /<meta[^>]*property="og:url"[^>]*content="([^"]*)"/
const TWITTER_TITLE = /<meta[^>]*name="twitter:title"[^>]*content="([^"]*)"/

describe('renderPage', () => {
  it('見出しにサイト名を添える', () => {
    expect(attr(renderPage(TEMPLATE, page(), OPTIONS), TITLE)).toBe('2023 セットリスト | サイト名')
  })

  it('見出しを持たないページ (ホーム) はサイト名だけにする', () => {
    const html = renderPage(TEMPLATE, page({ path: '', title: undefined }), OPTIONS)
    expect(attr(html, TITLE)).toBe('サイト名')
  })

  it('改行をまたぐ meta の content も差し替える', () => {
    // index.html は整形の都合で description が 3 行に分かれている
    expect(attr(renderPage(TEMPLATE, page(), OPTIONS), DESCRIPTION)).toBe('2023 の説明')
  })

  it('canonical をそのページの URL にする', () => {
    expect(attr(renderPage(TEMPLATE, page(), OPTIONS), CANONICAL)).toBe('https://example.test/2023')
  })

  it('ホームの canonical はサイトの入口になる', () => {
    const html = renderPage(TEMPLATE, page({ path: '', title: undefined }), OPTIONS)
    expect(attr(html, CANONICAL)).toBe('https://example.test/')
  })

  it('OGP と Twitter カードにも同じ文言を配る', () => {
    const html = renderPage(TEMPLATE, page(), OPTIONS)
    expect(attr(html, OG_TITLE)).toBe('2023 セットリスト | サイト名')
    expect(attr(html, TWITTER_TITLE)).toBe('2023 セットリスト | サイト名')
    expect(attr(html, OG_URL)).toBe('https://example.test/2023')
  })

  it('資産への参照はそのまま残す', () => {
    // テンプレートはビルド済みの index.html。ハッシュ付きの参照を壊すと真っ白になる
    expect(renderPage(TEMPLATE, page(), OPTIONS)).toContain('/assets/index-abc123.js')
  })

  it('中身は空のまま。描画は今までどおりブラウザに任せる', () => {
    expect(renderPage(TEMPLATE, page(), OPTIONS)).toContain('<div id="root"></div>')
  })

  it('構造化データを head の中に足す', () => {
    const html = renderPage(TEMPLATE, page({ jsonLd: [{ '@type': 'WebPage' }] }), OPTIONS)
    const head = html.slice(0, html.indexOf('</head>'))
    expect(head).toContain('"@type":"WebPage"')
    expect(head).toContain('"@context":"https://schema.org"')
  })

  it('元からある構造化データは消さない', () => {
    const html = renderPage(TEMPLATE, page({ jsonLd: [{ '@type': 'WebPage' }] }), OPTIONS)
    expect(html).toContain('{"@type":"WebSite"}')
    expect(html.match(/application\/ld\+json/g)).toHaveLength(2)
  })

  it('構造化データが無いページには script を足さない', () => {
    const html = renderPage(TEMPLATE, page(), OPTIONS)
    expect(html.match(/application\/ld\+json/g)).toHaveLength(1)
  })

  it('構造化データの中の < を退避する。script が途中で閉じないようにするため', () => {
    const html = renderPage(TEMPLATE, page({ jsonLd: [{ name: '</script><img>' }] }), OPTIONS)
    expect(html).not.toContain('</script><img>')
    expect(html).toContain('\\u003c')
  })

  it('文言に含まれる引用符や記号を逃がす', () => {
    const html = renderPage(
      TEMPLATE,
      page({ title: 'Hatsune Miku "Magical Mirai"', description: 'a & b < c' }),
      OPTIONS,
    )
    expect(html).toContain('&quot;Magical Mirai&quot;')
    expect(attr(html, DESCRIPTION)).toBe('a &amp; b &lt; c')
  })
})

describe('renderNotFound', () => {
  it('索引に載せない', () => {
    expect(attr(renderNotFound(TEMPLATE), ROBOTS)).toBe('noindex, follow')
  })

  it('canonical を消す。誤った URL をホームの別名にしないため', () => {
    expect(renderNotFound(TEMPLATE)).not.toContain('rel="canonical"')
  })

  it('アプリは起動できるままにする。来た人がそのままサイトを使えるように', () => {
    const html = renderNotFound(TEMPLATE)
    expect(html).toContain('<div id="root"></div>')
    expect(html).toContain('/assets/index-abc123.js')
  })
})
