import { describe, expect, it } from 'vitest'
import type { Performance } from './Performance'
import { venueMapEmbedUrl } from './venueMapUrl'

function performance(overrides: Partial<Performance> = {}): Performance {
  return {
    id: 'tokyo',
    region: 'tokyo',
    city: { ja: '東京', en: 'Tokyo' },
    venue: { ja: '架空ホール', en: 'Fixture Hall' },
    shows: [],
    ...overrides,
  }
}

/** 埋め込み URL の検索語 (q) を取り出す。 */
function queryOf(url: string): string | null {
  return new URL(url).searchParams.get('q')
}

describe('venueMapEmbedUrl', () => {
  it('会場名を検索語にした埋め込み地図の URL を返す', () => {
    const url = venueMapEmbedUrl(performance(), 'ja')
    expect(url).toBeDefined()
    expect(queryOf(url!)).toBe('架空ホール')
    expect(new URL(url!).searchParams.get('output')).toBe('embed')
  })

  it('検索語は常に日本語の会場名を使う。国内の会場は日本語表記の方が 1 か所に定まる', () => {
    expect(queryOf(venueMapEmbedUrl(performance(), 'en')!)).toBe('架空ホール')
  })

  it('地図の言語だけはロケールに従う', () => {
    expect(new URL(venueMapEmbedUrl(performance(), 'ko')!).searchParams.get('hl')).toBe('ko')
  })

  it('会場名で引けない場所は mapQuery で上書きできる', () => {
    const subject = performance({ mapQuery: '架空市 架空ホール 大展示場' })
    expect(queryOf(venueMapEmbedUrl(subject, 'ja')!)).toBe('架空市 架空ホール 大展示場')
  })

  it('会場が未確定の年は地図を出さない', () => {
    expect(venueMapEmbedUrl(performance({ venue: undefined }), 'ja')).toBeUndefined()
  })

  it('最寄り駅や道が一緒に入る縮尺で開く。建物だけに寄るとどの街か読めない', () => {
    expect(new URL(venueMapEmbedUrl(performance(), 'ja')!).searchParams.get('z')).toBe('14')
  })
})
