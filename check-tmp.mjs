import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: 'ja-JP' })
const years = [
  '2013',
  '2014',
  '2015',
  '2016',
  '2017',
  '2018',
  '2019',
  '2020',
  '2021',
  '10th',
  '2023',
  '2024',
  '2025',
  '2026',
]
for (const y of years) {
  await page.goto(`http://localhost:4173/${y}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('ol li button[data-song]')
  const found = await page.evaluate(() => {
    const out = { theme: [], gp: [] }
    for (const li of document.querySelectorAll('ol > li')) {
      const tags = [...li.querySelectorAll('span')].map((s) => s.textContent?.trim())
      const song = li.querySelector('button[data-song]')?.getAttribute('data-song')
      if (tags.includes('テーマソング')) out.theme.push(song)
      if (tags.includes('楽曲グランプリ')) out.gp.push(song)
    }
    return out
  })
  console.log(
    `${y.padEnd(5)} テーマソング=${(found.theme.join(',') || '—').padEnd(24)} 楽曲グランプリ=${found.gp.join(',') || '—'}`,
  )
}
await browser.close()
