import { describe, expect, it } from 'vitest'
import { parseRoute, rankingPath, STATISTICS_PATH } from './routes'

describe('parseRoute', () => {
  it('空のパスは既定の開催回を指す', () => {
    expect(parseRoute('', '2025')).toEqual({ kind: 'edition', slug: '2025' })
  })

  it('slug はそのまま開催回のページになる。西暦でない slug も同じ', () => {
    expect(parseRoute('10th', '2025')).toEqual({ kind: 'edition', slug: '10th' })
  })

  it('統計ページと、その下のランキングを見分ける', () => {
    expect(parseRoute(STATISTICS_PATH, '2025')).toEqual({ kind: 'statistics' })
    expect(parseRoute(rankingPath('songs'), '2025')).toEqual({ kind: 'ranking', ranking: 'songs' })
  })

  it('統計の下の知らないページは統計ページに寄せる', () => {
    expect(parseRoute(`${STATISTICS_PATH}/unknown`, '2025')).toEqual({ kind: 'statistics' })
  })
})
