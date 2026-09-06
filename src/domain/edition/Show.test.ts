import { describe, expect, it } from 'vitest'
import { parseEventDate, showDate } from './Show'

describe('parseEventDate', () => {
  it('YYYY-MM-DD をその日の日付として読む', () => {
    const date = parseEventDate('2023-08-25')
    expect(date.getUTCFullYear()).toBe(2023)
    expect(date.getUTCMonth()).toBe(7)
    expect(date.getUTCDate()).toBe(25)
  })

  it('東西どちらのタイムゾーンで整形しても日付がずれない', () => {
    // 現地時刻で読むと、日本では翌日に、アメリカでは前日にずれる。
    // UTC の正午で作ってあるので、正午からの差が 12 時間未満のところ
    // (UTC-11〜+11) では同じ日に留まる。公演地の日本も、対応 4 言語の地域も
    // この範囲に入る。
    const date = parseEventDate('2023-08-25')
    const format = (timeZone: string) =>
      new Intl.DateTimeFormat('en-CA', { timeZone, dateStyle: 'short' }).format(date)

    expect(format('Asia/Tokyo')).toBe('2023-08-25')
    expect(format('Asia/Seoul')).toBe('2023-08-25')
    expect(format('Asia/Taipei')).toBe('2023-08-25')
    expect(format('America/Los_Angeles')).toBe('2023-08-25')
    expect(format('Pacific/Honolulu')).toBe('2023-08-25')
  })

  it('年をまたぐ日付も正しく読む', () => {
    const date = parseEventDate('2023-02-11')
    expect(date.getUTCFullYear()).toBe(2023)
    expect(date.getUTCMonth()).toBe(1)
    expect(date.getUTCDate()).toBe(11)
  })
})

describe('showDate', () => {
  it('公演回の開催日を Date にする', () => {
    const date = showDate({ id: 'd1', date: '2013-08-30', label: 'Day.1' })
    expect(date.getUTCDate()).toBe(30)
  })
})
