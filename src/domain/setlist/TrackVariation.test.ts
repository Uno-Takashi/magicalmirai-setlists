/**
 * 入れ替わりの分類は、データに書いた区分ではなく「どの公演回で演奏されたか」から
 * 計算する (CLAUDE.md のドメイン知識)。計算で決めている以上、どの並びがどの軸に
 * なるのかはここで固定しておく。
 */

import { describe, expect, it } from 'vitest'
import type { Session } from '@/domain/edition/Show'
import type { ShowRef, Track, TrackVariant } from './Track'
import { classifyVariation, variantScope, variationAxes } from './TrackVariation'

/** 候補を 1 つ作る。曲名は分類に関わらないので、並び順から機械的に付ける。 */
function variant(shows: readonly ShowRef[], index = 0): TrackVariant {
  return { song: `曲${index}`, shows }
}

/** 候補の並びから枠を組み立てる。 */
function track(...showsOfVariants: readonly ShowRef[][]): Track {
  return {
    order: 1,
    tags: [],
    variants: showsOfVariants.map((shows, index) => variant(shows, index)),
  }
}

/** 公演回 id の末尾で昼夜を決める索引。`tokyo/1m` なら昼。 */
const sessionOf = (ref: ShowRef): Session | undefined => {
  if (ref.endsWith('m')) return 'matinee'
  if (ref.endsWith('e')) return 'evening'
  return undefined
}

describe('classifyVariation', () => {
  it('候補が 1 つだけの枠は固定曲', () => {
    expect(classifyVariation(track(['tokyo/d1']))).toBe('fixed')
  })

  it('候補が 1 つなら公演回が記録されていなくても固定曲', () => {
    expect(classifyVariation(track([]))).toBe('fixed')
  })

  it('公演回が記録されていない候補が混ざると、軸を言えないので日替わり', () => {
    expect(classifyVariation(track(['tokyo/d1'], []))).toBe('daily')
  })

  it('候補が会場ごとにそろっていれば会場替わり', () => {
    const subject = track(['tokyo/d1', 'tokyo/d2'], ['osaka/d1'])
    expect(classifyVariation(subject)).toBe('venue')
  })

  it('どの会場でも同じ日程で分かれていれば日程替わり', () => {
    const subject = track(['tokyo/d1', 'osaka/d1'], ['tokyo/d2', 'osaka/d2'])
    expect(classifyVariation(subject)).toBe('schedule')
  })

  it('会場でも日程でも言い表せれば、両方の軸を持つ', () => {
    const subject = track(['tokyo/d1'], ['osaka/d2'])
    expect(classifyVariation(subject)).toBe('venue-and-schedule')
  })

  it('昼と夜で丸ごと入れ替わるだけなら昼夜入れ替え', () => {
    const subject = track(['tokyo/1m', 'osaka/1m'], ['tokyo/1e', 'osaka/1e'])
    expect(classifyVariation(subject, sessionOf)).toBe('session')
  })

  it('昼夜の索引を渡さなければ、同じ並びは日程替わりに落ちる', () => {
    const subject = track(['tokyo/1m', 'osaka/1m'], ['tokyo/1e', 'osaka/1e'])
    expect(classifyVariation(subject)).toBe('schedule')
  })

  it('昼夜の区別が付かない回が混ざると、昼夜入れ替えとは呼べない', () => {
    const subject = track(['tokyo/1m', 'osaka/d1'], ['tokyo/1e', 'osaka/d2'])
    expect(classifyVariation(subject, sessionOf)).not.toBe('session')
  })

  it('会場でも分かれているときは、昼夜入れ替えより会場替わりを優先する', () => {
    // 東京は昼、大阪は夜。昼夜でも会場でも言い表せるが、会場の方が実態に近い
    const subject = track(['tokyo/1m'], ['osaka/1e'])
    expect(classifyVariation(subject, sessionOf)).not.toBe('session')
  })

  it('会場も日程もまたいで入れ替わるものは日替わり', () => {
    const subject = track(['tokyo/d1', 'osaka/d2'], ['tokyo/d2', 'osaka/d1'])
    expect(classifyVariation(subject, sessionOf)).toBe('daily')
  })

  it('候補が 3 つ以上でも会場ごとにそろっていれば会場替わり', () => {
    const subject = track(['tokyo/d1', 'tokyo/d2'], ['osaka/d1'], ['sapporo/d1', 'sapporo/d2'])
    expect(classifyVariation(subject)).toBe('venue')
  })
})

describe('variationAxes', () => {
  it('固定曲は軸を持たない', () => {
    expect(variationAxes('fixed')).toEqual([])
  })

  it('会場かつ日程の分類は、2 つの軸に開く', () => {
    expect(variationAxes('venue-and-schedule')).toEqual(['venue', 'schedule'])
  })

  it('それ以外はその軸ひとつ', () => {
    expect(variationAxes('venue')).toEqual(['venue'])
    expect(variationAxes('session')).toEqual(['session'])
    expect(variationAxes('schedule')).toEqual(['schedule'])
    expect(variationAxes('daily')).toEqual(['daily'])
  })
})

describe('variantScope', () => {
  it('公演回が記録されていない候補は範囲を持たない', () => {
    const subject = track([], ['tokyo/d1'])
    expect(variantScope(subject, subject.variants[0]!)).toBeNull()
  })

  it('会場をまるごと占める候補は公演地で言い表す', () => {
    const subject = track(['tokyo/d1', 'tokyo/d2'], ['osaka/d1'])
    expect(variantScope(subject, subject.variants[0]!)).toEqual({
      kind: 'venues',
      performanceIds: ['tokyo'],
    })
  })

  it('どの会場でも同じ日程の候補は公演回で言い表す', () => {
    const subject = track(['tokyo/d1', 'osaka/d1'], ['tokyo/d2', 'osaka/d2'])
    expect(variantScope(subject, subject.variants[0]!)).toEqual({
      kind: 'shows',
      showIds: ['d1'],
    })
  })

  it('会場も日程もまたぐ候補は、そのままの参照で言い表す', () => {
    const subject = track(['tokyo/d1', 'osaka/d2'], ['tokyo/d2', 'osaka/d1'])
    expect(variantScope(subject, subject.variants[0]!)).toEqual({
      kind: 'mixed',
      shows: ['tokyo/d1', 'osaka/d2'],
    })
  })

  it('公演地が重複していても、公演地は 1 つずつに畳む', () => {
    const subject = track(['tokyo/d1', 'tokyo/d2'], ['osaka/d1'])
    const scope = variantScope(subject, subject.variants[0]!)
    expect(scope).toMatchObject({ kind: 'venues', performanceIds: ['tokyo'] })
  })
})
