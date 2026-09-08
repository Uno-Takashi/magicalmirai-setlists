/// <reference types="vitest/config" />
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { readEditions, sitePages, type PageMeta } from './build/pageMeta.ts'
import { ja } from './src/infrastructure/i18n/locales/ja.ts'
import { renderNotFound, renderPage } from './build/renderPage.ts'

/**
 * sitemap.xml と robots.txt をビルド時に作る。
 * ページの一覧は build/pageMeta.ts が持つので、年を足せば自動で URL が増える。
 */
function seoFiles(siteUrl: string, pages: readonly PageMeta[]): Plugin {
  return {
    name: 'seo-files',
    apply: 'build',
    generateBundle() {
      const urls = pages.map((page) => `  <url><loc>${siteUrl}${page.path}</loc></url>`).join('\n')

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`,
      })
    },
  }
}

/**
 * ページごとの HTML を書き出す。
 *
 * **これが無いと、サイトの入口以外はすべて 404 で返る。** 静的ホスティングは
 * 実体の無いパスに 404.html を返すだけなので、`/2023` のような URL は
 * ブラウザでは動いても、検索エンジンからは存在しないページに見えていた。
 *
 * 実体を置くと 200 で返るようになり、JavaScript を実行しない収集器
 * (SNS のカード生成など) にもそのページの title / description / OGP が届く。
 *
 * 1 ページにつき 2 か所へ書くのは、ホスティングによって拡張子なしの URL の
 * 解決の仕方が違うため。`2023.html` を見るもの (GitHub Pages) と
 * `2023/index.html` を見るもの (末尾スラッシュを付けて来た場合) の両方に応える。
 * どちらも canonical は `<siteUrl>2023` の 1 つだけを指すので、
 * 同じ内容が 2 つの URL として索引されることはない。
 */
function prerenderPages(siteUrl: string, siteName: string, pages: readonly PageMeta[]): Plugin {
  let outDir = 'dist'
  return {
    name: 'prerender-pages',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const root = path.resolve(dirname, outDir)
      const template = fs.readFileSync(path.join(root, 'index.html'), 'utf8')

      for (const page of pages) {
        const html = renderPage(template, page, { siteUrl, siteName })
        // ホームは index.html そのもの。書き出し先が同じなので上書きで済ませる
        if (page.path === '') {
          fs.writeFileSync(path.join(root, 'index.html'), html)
          continue
        }
        fs.writeFileSync(path.join(root, `${page.path}.html`), html)
        fs.mkdirSync(path.join(root, page.path), { recursive: true })
        fs.writeFileSync(path.join(root, page.path, 'index.html'), html)
      }

      // 実在しない URL 向け。404 のまま返るので、索引には載せない
      fs.writeFileSync(path.join(root, '404.html'), renderNotFound(template))
    },
  }
}

const dirname = import.meta.dirname

/** サイト名。title の後ろに付く。画面と揃えるため ja ロケールから取る。 */
const SITE_NAME = ja['app.title']

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 配信先に依存する値は .env に置く。設定ファイルからは import.meta.env を
  // 参照できないので loadEnv で読む。
  const env = loadEnv(mode, dirname, 'VITE_')

  // ページの一覧は sitemap と、ページごとの HTML の両方が使う。
  // 並びがずれないよう、ここで 1 度だけ組み立てて両方へ渡す。
  const editions = readEditions(path.resolve(dirname, 'dataset'))
  const pages = sitePages(env.VITE_SITE_URL, editions)

  return {
    base: env.VITE_BASE_PATH,
    server: {
      // すべてのアドレスで待ち受ける。既定の localhost は Node が ::1 (IPv6) に
      // 解決するため、devcontainer だと VS Code のポート転送 (127.0.0.1 へ繋ぐ) が
      // 届かず、ブラウザが読み込み中のまま止まる。
      host: true,
    },
    plugins: [
      react(),
      tailwindcss(),
      prerenderPages(env.VITE_SITE_URL, SITE_NAME, pages),
      seoFiles(env.VITE_SITE_URL, pages),
    ],
    resolve: {
      alias: {
        '@': path.resolve(dirname, './src'),
      },
    },
    test: {
      projects: [
        // Storybook のストーリーをテストとして実行する
        // https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
        {
          extends: true,
          plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
          test: {
            name: 'storybook',
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({}),
              instances: [{ browser: 'chromium' }],
            },
          },
        },
        // dataset/ の検証。ブラウザを立ち上げないので単体で速く回せる
        // (`pnpm test:dataset`)。Vite 経由なので loadCatalog の
        // import.meta.glob がそのまま動き、本番と同じ読み込み経路を通る。
        {
          extends: true,
          test: {
            name: 'dataset',
            environment: 'node',
            include: ['src/**/*.node.test.ts'],
          },
        },
        // ドメイン層・ユースケース・表示のための計算の単体テスト。
        // React にも dataset にも依らない純粋な関数だけを対象にするので、
        // ブラウザを立ち上げず node で速く回せる (`pnpm test:unit`)。
        //
        // dataset の検証 (*.node.test.ts) はここでは拾わない。あちらは実データを
        // 読むので、データが欠けているときに落ちる範囲を分けておきたい。
        {
          extends: true,
          test: {
            name: 'unit',
            environment: 'node',
            include: ['src/**/*.test.ts', 'build/**/*.test.ts'],
            exclude: ['src/**/*.node.test.ts'],
          },
        },
      ],
    },
  }
})
