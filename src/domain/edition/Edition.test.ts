import { describe, expect, it } from 'vitest'
import type { Performance } from './Performance'
import type { Show } from './Show'
import { editionPeriod, findPerformance, sessionIndex } from './Edition'
import type { Edition } from './Edition'

function show(id: string, date: string, session?: Show['session']): Show {
  return { id, date, label: id, session }
}

function performance(id: string, shows: readonly Show[]): Performance {
  return { id, region: 'other', city: { ja: id }, shows }
}

function edition(performances: readonly Performance[]): Edition {
  return {
    year: 2023,
    slug: '10th',
    name: { ja: 'マジカルミライ 10th Anniversary' },
    themeColors: [],
    performances,
  }
}

describe('editionPeriod', () => {
  it('開催回全体の最初と最後の日を返す', () => {
    const subject = edition([
      performance('osaka', [show('d1', '2022-08-12'), show('d2', '2022-08-13')]),
      performance('tokyo', [show('d1', '2022-09-02')]),
    ])
    expect(editionPeriod(subject)).toEqual({ from: '2022-08-12', to: '2022-09-02' })
  })

  it('開催が暦年をまたいでも、最初と最後で言い表せる', () => {
    // 10th の札幌公演は 2023 年 2 月開催だった
    const subject = edition([
      performance('tokyo', [show('d1', '2022-09-02')]),
      performance('sapporo', [show('d1', '2023-02-11')]),
    ])
    expect(editionPeriod(subject)).toEqual({ from: '2022-09-02', to: '2023-02-11' })
  })

  it('日程が未発表の年は期間を持たない', () => {
    expect(editionPeriod(edition([performance('tokyo', [])]))).toBeNull()
    expect(editionPeriod(edition([]))).toBeNull()
  })
})

describe('findPerformance', () => {
  const subject = edition([performance('tokyo', []), performance('osaka', [])])

  it('id で公演を引ける', () => {
    expect(findPerformance(subject, 'osaka')?.id).toBe('osaka')
  })

  it('無い id なら undefined', () => {
    expect(findPerformance(subject, 'sapporo')).toBeUndefined()
  })
})

describe('sessionIndex', () => {
  it('`<公演 id>/<公演回 id>` から昼夜を引ける', () => {
    const subject = edition([
      performance('tokyo', [
        show('d1m', '2023-08-25', 'matinee'),
        show('d1e', '2023-08-25', 'evening'),
      ]),
    ])
    const index = sessionIndex(subject)
    expect(index.get('tokyo/d1m')).toBe('matinee')
    expect(index.get('tokyo/d1e')).toBe('evening')
  })

  it('昼夜の区別が無い公演回は載せない', () => {
    const subject = edition([performance('tokyo', [show('d1', '2013-08-30')])])
    expect(sessionIndex(subject).has('tokyo/d1')).toBe(false)
  })

  it('公演地が違えば別の鍵になる', () => {
    const subject = edition([
      performance('tokyo', [show('d1m', '2023-08-25', 'matinee')]),
      performance('osaka', [show('d1m', '2023-09-01', 'evening')]),
    ])
    const index = sessionIndex(subject)
    expect(index.get('tokyo/d1m')).toBe('matinee')
    expect(index.get('osaka/d1m')).toBe('evening')
  })
})
