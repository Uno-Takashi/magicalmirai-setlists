// build の成果物を vite preview で配信し、sitemap の全ページを Chromium で開いて、
// アプリが実際に描画されることを確かめる。gates.sh smoke から呼ぶ。
//
//   node smoke.mjs <dist>        環境変数 SMOKE_PORT（既定 4317）
//
// ビルドが通っても実行時に落ちる更新 (React · HeroUI · motion · gsap · nivo など) を拾う。
// Storybook のテストは作り物のカタログで部品を見るだけなので、実データでページ全体を
// 組み立てたときの壊れ方はここでしか分からない。
//
// 落とすもの: 応答が 200 でない · #root が空のまま · ページの例外 (pageerror) ·
// console.error · 同じオリジンへの要求の失敗。
// 外部 (YouTube など) への要求の失敗は数えて出すだけにする (この環境から届かないことがある)。
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { chromium } from 'playwright'

const dist = path.resolve(process.argv[2] ?? 'dist')
const port = Number(process.env.SMOKE_PORT ?? 4317)
const origin = `http://127.0.0.1:${port}`

const portOpen = () =>
  new Promise((resolve) => {
    const socket = net.connect(port, '127.0.0.1')
    socket.once('connect', () => (socket.destroy(), resolve(true)))
    socket.once('error', () => resolve(false))
  })

// 先客がいると、古いビルドを叩いて通ってしまう。
if (await portOpen()) {
  console.error(`${port} 番が使われている。残っているサーバを止めるか SMOKE_PORT を変える`)
  process.exit(1)
}

const urls = [
  ...fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g),
].map((m) => m[1])
const siteUrl = urls.find((u) => u.endsWith('/'))
// 実在しない URL でもアプリは起動できる (404.html と同じ中身が返る) ことを見る。
const targets = [...urls.map((u) => u.slice(siteUrl.length)), '__smoke_not_found__']

const server = spawn(
  'pnpm',
  [
    'exec',
    'vite',
    'preview',
    '--outDir',
    dist,
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
    '--strictPort',
  ],
  { detached: true, stdio: ['ignore', 'pipe', 'pipe'] },
)
let serverLog = ''
server.stdout.on('data', (d) => (serverLog += d))
server.stderr.on('data', (d) => (serverLog += d))
const stopServer = () => {
  try {
    process.kill(-server.pid, 'SIGTERM')
  } catch {
    // 既に止まっている
  }
}
process.on('exit', stopServer)
process.on('SIGINT', () => process.exit(1))
process.on('SIGTERM', () => process.exit(1))

for (let i = 0; i < 60 && !(await portOpen()); i++) await new Promise((r) => setTimeout(r, 500))
if (!(await portOpen())) {
  console.error(`vite preview が ${port} 番で起動しなかった\n${serverLog}`)
  process.exit(1)
}

const browser = await chromium.launch()
let failures = 0
let blankInARow = 0 // 描画されないページが続いたら、アプリ全体が起動していない
let externalFailures = 0

for (const slug of targets) {
  const page = await browser.newPage({ locale: 'ja-JP' }) // サイトの主言語で開く
  const problems = []
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const at = msg.location().url ?? ''
    if (at && !at.startsWith(origin)) externalFailures++
    else problems.push(`console.error: ${msg.text().slice(0, 200)}`)
  })
  page.on('requestfailed', (req) => {
    if (req.url().startsWith(origin))
      problems.push(`requestfailed: ${req.url()} ${req.failure()?.errorText}`)
    else externalFailures++
  })
  page.on('response', (res) => {
    if (
      res.url().startsWith(origin) &&
      res.status() >= 400 &&
      res.request().resourceType() !== 'document'
    ) {
      problems.push(`HTTP ${res.status()}: ${res.url()}`)
    }
  })

  const response = await page.goto(`${origin}/${slug}`, { waitUntil: 'load', timeout: 30_000 })
  const status = response?.status()
  if (status !== 200) problems.push(`HTTP ${status}（期待 200）`)
  const rendered = await page
    .waitForFunction(() => (document.getElementById('root')?.childElementCount ?? 0) > 0, null, {
      timeout: 15_000,
    })
    .then(() => true)
    .catch(() => false)
  if (!rendered) problems.push('#root が空のまま')
  blankInARow = rendered ? 0 : blankInARow + 1
  // 描画直後に投げる例外 (effect の中など) を拾うため、少し待つ。
  await page.waitForTimeout(500)
  const title = await page.title()

  const label = `/${slug}`.padEnd(32)
  if (problems.length) {
    failures++
    console.log(`NG  ${label} ${title}`)
    for (const p of problems) console.log(`      ${p}`)
  } else {
    console.log(`ok  ${label} ${title}`)
  }
  await page.close()
  // 1 ページにつき 15 秒待つので、全滅のときに全ページを回すと数分かかる。
  if (blankInARow >= 3) {
    console.log(`      3 ページ続けて描画されなかったので、残りは開かない`)
    break
  }
}

await browser.close()
console.log(
  `\n${targets.length} ページ · NG ${failures} · 外部への要求の失敗 ${externalFailures}（数えるだけ）`,
)
process.exit(failures ? 1 : 0)
