// build の成果物 (dist/) が、検索エンジンと静的ホスティングから見て正しい形かを確かめる。
// gates.sh dist から呼ぶ。依存を足さないよう、HTML は正規表現で必要な所だけを読む。
//
//   node check-dist.mjs <dist>
//
// 確かめること (CLAUDE.md「ページごとの HTML (SEO)」の約束):
// - sitemap.xml の全 URL に `<slug>.html` と `<slug>/index.html` があり、canonical と og:url が
//   その URL を指す。robots は noindex でない
// - 404.html は noindex で、canonical を持たない
// - robots.txt が sitemap.xml を指す
// - index.html が参照する JS / CSS が実在し、空でない
// - canonical に localhost が残っていない
//
// 最後に成果物の sha256 を $LOG_DIR/dist.sha256 に書く。control と比べれば、
// 更新が配信物を変えたかどうかが分かる。
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve(process.argv[2] ?? 'dist')
const errors = []
const fail = (message) => errors.push(message)
const read = (file) => fs.readFileSync(path.join(dist, file), 'utf8')
const exists = (file) => fs.existsSync(path.join(dist, file))

const attr = (html, pattern) => html.match(pattern)?.[1]
const canonicalOf = (html) => attr(html, /<link\s+[^>]*rel="canonical"[^>]*href="([^"]*)"/)
const ogUrlOf = (html) => attr(html, /<meta\s+[^>]*property="og:url"[^>]*content="([^"]*)"/)
const robotsOf = (html) => attr(html, /<meta\s+[^>]*name="robots"[^>]*content="([^"]*)"/)

for (const file of ['index.html', '404.html', 'sitemap.xml', 'robots.txt']) {
  if (!exists(file)) fail(`${file} が無い`)
}
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

// ── sitemap の全ページ ──
const urls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
if (urls.length === 0) fail('sitemap.xml に URL が無い')
const siteUrl = urls.find((u) => u.endsWith('/'))
if (!siteUrl) fail('sitemap.xml にサイトの入口 (末尾が / の URL) が無い')

for (const url of urls) {
  const slug = siteUrl && url.startsWith(siteUrl) ? url.slice(siteUrl.length) : null
  if (slug === null) {
    fail(`${url}: サイトの入口 ${siteUrl} の下にない`)
    continue
  }
  const files = slug === '' ? ['index.html'] : [`${slug}.html`, `${slug}/index.html`]
  for (const file of files) {
    if (!exists(file)) {
      fail(`${url}: ${file} が無い`)
      continue
    }
    const html = read(file)
    if (canonicalOf(html) !== url) fail(`${file}: canonical が ${canonicalOf(html)}（期待 ${url}）`)
    if (ogUrlOf(html) !== url) fail(`${file}: og:url が ${ogUrlOf(html)}（期待 ${url}）`)
    if (/noindex/.test(robotsOf(html) ?? '')) fail(`${file}: robots が noindex`)
  }
}
console.log(`sitemap: ${urls.length} ページ（${siteUrl}）`)

// ── 404.html ──
const notFound = read('404.html')
if (!/noindex/.test(robotsOf(notFound) ?? '')) fail('404.html: robots が noindex でない')
if (canonicalOf(notFound) !== undefined) fail('404.html: canonical がある')

// ── robots.txt ──
if (siteUrl && !read('robots.txt').includes(`Sitemap: ${siteUrl}sitemap.xml`)) {
  fail(`robots.txt: Sitemap: ${siteUrl}sitemap.xml が無い`)
}

// ── index.html が参照する資産 ──
const index = read('index.html')
const assets = [...index.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((m) => m[1])
if (assets.length === 0) fail('index.html が JS / CSS を参照していない')
for (const ref of assets) {
  if (/^https?:/.test(ref)) continue
  const file = ref.replace(/^\/+/, '')
  const ok = exists(file) && fs.statSync(path.join(dist, file)).size > 0
  console.log(`  ${ok ? 'ok  ' : 'MISS'} ${file}`)
  if (!ok) fail(`index.html の参照先 ${file} が空か存在しない`)
}

if (/localhost/.test(canonicalOf(index) ?? ''))
  fail('index.html: canonical に localhost が残っている')

// ── 指紋 ──
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]))
const files = walk(dist).sort()
let bytes = 0
const lines = files.map((file) => {
  const data = fs.readFileSync(file)
  bytes += data.length
  return `${crypto.createHash('sha256').update(data).digest('hex')}  ${path.relative(dist, file)}`
})
const jsBytes = files
  .filter((f) => f.endsWith('.js'))
  .reduce((sum, f) => sum + fs.statSync(f).size, 0)
console.log(
  `files: ${files.length} · total: ${(bytes / 1024).toFixed(0)} KiB · js: ${(jsBytes / 1024).toFixed(0)} KiB`,
)
if (process.env.LOG_DIR) {
  fs.writeFileSync(path.join(process.env.LOG_DIR, 'dist.sha256'), lines.join('\n') + '\n')
  console.log(`dist.sha256: ${path.join(process.env.LOG_DIR, 'dist.sha256')}`)
}

if (errors.length) {
  console.error(`\n${errors.length} 件の問題:\n${errors.join('\n')}`)
  process.exit(1)
}
console.log('ok')
