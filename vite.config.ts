/// <reference types="vitest/config" />
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import fs from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/**
 * sitemap.xml と robots.txt をビルド時に作る。
 * dataset に年を足せば自動で URL が増えるので、手で並べ直さなくてよい。
 */
function seoFiles(siteUrl: string): Plugin {
  return {
    name: 'seo-files',
    apply: 'build',
    generateBundle() {
      const slugs = fs
        .readdirSync(path.resolve(dirname, 'dataset'))
        .filter((entry) => /^\d+$/.test(entry))
        .map((entry) => {
          const file = path.resolve(dirname, 'dataset', entry, 'edition.yaml')
          const doc = parseYaml(fs.readFileSync(file, 'utf8')) as { slug: string; year: number }
          return doc
        })
        .sort((a, b) => b.year - a.year)
        .map((doc) => doc.slug)

      const paths = [
        '',
        ...slugs,
        'statics',
        'statics/producers',
        'statics/songs',
        'statics/vocaloids',
      ]
      const urls = paths.map((p) => `  <url><loc>${siteUrl}${p}</loc></url>`).join('\n')

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
 * 静的ホスティング向けの SPA フォールバック。
 *
 * GitHub Pages は実体の無いパスに 404.html を返すため、index.html をそのまま
 * 複製しておくと /statics のようなパスでもアプリが起動できる。
 */
function spaFallback(): Plugin {
  let outDir = 'dist'
  return {
    name: 'spa-fallback-404',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const root = path.resolve(dirname, outDir)
      fs.copyFileSync(path.join(root, 'index.html'), path.join(root, '404.html'))
    },
  }
}

const dirname = import.meta.dirname

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 配信先に依存する値は .env に置く。設定ファイルからは import.meta.env を
  // 参照できないので loadEnv で読む。
  const env = loadEnv(mode, dirname, 'VITE_')

  return {
    base: env.VITE_BASE_PATH,
    server: {
      // すべてのアドレスで待ち受ける。既定の localhost は Node が ::1 (IPv6) に
      // 解決するため、devcontainer だと VS Code のポート転送 (127.0.0.1 へ繋ぐ) が
      // 届かず、ブラウザが読み込み中のまま止まる。
      host: true,
    },
    plugins: [react(), tailwindcss(), spaFallback(), seoFiles(env.VITE_SITE_URL)],
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
      ],
    },
  }
})
