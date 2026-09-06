import { describe, expect, it } from 'vitest'
import type { Show } from './Show'
import { performancePeriod, showsByDate } from './Performance'
import type { Performance } from './Performance'

function show(id: string, date: string, session?: Show['session']): Show {
  return { id, date, label: id, session }
}

function performance(shows: readonly Show[]): Performance {
  return { id: 'tokyo', region: 'tokyo', city: { ja: '東京' }, shows }
}

describe('showsByDate', () => {
  it('同じ日の公演回をまとめ、日付の昇順に並べる', () => {
    const subject = performance([
      show('d2', '2023-08-26'),
      show('d1', '2023-08-25'),
      show('d3', '2023-08-27'),
    ])
    expect(showsByDate(subject).map((group) => group.date)).toEqual([
      '2023-08-25',
      '2023-08-26',
      '2023-08-27',
    ])
  })

  it('同じ日の中は昼から夜の順に並べる', () => {
    const subject = performance([
      show('e', '2023-08-25', 'evening'),
      show('m', '2023-08-25', 'matinee'),
    ])
    expect(showsByDate(subject)[0]?.shows.map((s) => s.id)).toEqual(['m', 'e'])
  })

  it('昼夜の区別が無い回は、区別のある回より後ろに置く', () => {
    const subject = performance([
      show('plain', '2023-08-25'),
      show('e', '2023-08-25', 'evening'),
      show('m', '2023-08-25', 'matinee'),
    ])
    expect(showsByDate(subject)[0]?.shows.map((s) => s.id)).toEqual(['m', 'e', 'plain'])
  })

  it('公演回が無ければ空', () => {
    expect(showsByDate(performance([]))).toEqual([])
  })
})

describe('performancePeriod', () => {
  it('その公演地の最初と最後の日を返す', () => {
    const subject = performance([show('d2', '2023-08-27'), show('d1', '2023-08-25')])
    expect(performancePeriod(subject)).toEqual({ from: '2023-08-25', to: '2023-08-27' })
  })

  it('1 日だけの公演は、始まりと終わりが同じ日になる', () => {
    expect(performancePeriod(performance([show('d1', '2013-08-30')]))).toEqual({
      from: '2013-08-30',
      to: '2013-08-30',
    })
  })

  it('日程が未発表なら期間を持たない', () => {
    expect(performancePeriod(performance([]))).toBeNull()
  })
})
