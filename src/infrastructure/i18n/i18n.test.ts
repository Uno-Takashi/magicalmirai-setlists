import { describe, expect, it } from 'vitest'
import { createTranslate, detectLocale, isLocale, LOCALES, LOCALE_LABELS } from './i18n'
import { en } from './locales/en'
import { ja } from './locales/ja'
import { ko } from './locales/ko'
import { zhHant } from './locales/zh-Hant'

const TABLES = { ja, en, 'zh-Hant': zhHant, ko } as const

/** `{name}` 形式のプレースホルダを取り出す。 */
function placeholdersOf(template: string): string[] {
  return [...template.matchAll(/\{(\w+)\}/g)].map((match) => match[1]!).sort()
}

describe('isLocale', () => {
  it('対応しているロケールだけを通す', () => {
    expect(isLocale('ja')).toBe(true)
    expect(isLocale('zh-Hant')).toBe(true)
    expect(isLocale('fr')).toBe(false)
  })
})

describe('detectLocale', () => {
  it('そのまま対応しているロケールがあれば使う', () => {
    expect(detectLocale(['zh-Hant'])).toBe('zh-Hant')
  })

  it('地域付きの指定は言語だけを見て寄せる', () => {
    expect(detectLocale(['en-US'])).toBe('en')
    expect(detectLocale(['ja-JP'])).toBe('ja')
    expect(detectLocale(['ko-KR'])).toBe('ko')
  })

  it('中国語はどの地域でも繁体字に寄せる', () => {
    expect(detectLocale(['zh-CN'])).toBe('zh-Hant')
  })

  it('先に並んでいる希望を優先する', () => {
    expect(detectLocale(['ko-KR', 'en-US'])).toBe('ko')
  })

  it('対応していない言語は読み飛ばして、次の希望を見る', () => {
    expect(detectLocale(['fr-FR', 'en-US'])).toBe('en')
  })

  it('どれも対応していなければ日本語にする', () => {
    expect(detectLocale(['fr-FR'])).toBe('ja')
    expect(detectLocale([])).toBe('ja')
  })
})

describe('createTranslate', () => {
  it('そのロケールの文言を返す', () => {
    expect(createTranslate('en')('app.title')).toBe(en['app.title'])
  })

  it('プレースホルダに値を差し込む', () => {
    const t = createTranslate('ja')
    expect(t('meta.editionTitle', { name: 'マジカルミライ 2024' })).toContain('マジカルミライ 2024')
    expect(t('meta.editionTitle', { name: 'x' })).not.toContain('{name}')
  })

  it('渡されなかったプレースホルダはそのまま残す', () => {
    expect(createTranslate('ja')('meta.editionTitle', {})).toContain('{name}')
  })

  it('数値も差し込める', () => {
    expect(createTranslate('ja')('statistics.appearances', { count: 12 })).toContain('12')
  })
})

describe('翻訳表', () => {
  it('すべてのロケールが日本語と同じ鍵を持つ', () => {
    const expected = Object.keys(ja).sort()
    for (const locale of LOCALES) {
      expect(Object.keys(TABLES[locale]).sort(), locale).toEqual(expected)
    }
  })

  it('空の文言を置かない', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(TABLES[locale])) {
        expect(value.trim(), `${locale}:${key}`).not.toBe('')
      }
    }
  })

  it('プレースホルダが日本語と食い違わない', () => {
    // 型では守れない。差し込み先が抜けると、画面に {year} がそのまま出る
    for (const locale of LOCALES) {
      for (const [key, template] of Object.entries(ja)) {
        const actual = placeholdersOf(TABLES[locale][key as keyof typeof ja])
        expect(actual, `${locale}:${key}`).toEqual(placeholdersOf(template))
      }
    }
  })

  it('読み上げ用の文言が 4 言語すべてにそろっている', () => {
    // 日本語だけ入れると、他の言語のときに日本語が読み上げられる
    const a11yKeys = Object.keys(ja).filter((key) => key.startsWith('a11y.'))
    expect(a11yKeys.length).toBeGreaterThan(0)
    for (const locale of LOCALES) {
      for (const key of a11yKeys) {
        expect(TABLES[locale][key as keyof typeof ja], `${locale}:${key}`).toBeTruthy()
      }
    }
  })

  it('「バーチャルシンガー」とは呼ばない', () => {
    // このドメインでは意味の異なる語。用語は「ボーカロイド」で統一する
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(TABLES[locale])) {
        expect(value, `${locale}:${key}`).not.toContain('バーチャルシンガー')
        expect(value.toLowerCase(), `${locale}:${key}`).not.toContain('virtual singer')
      }
    }
  })

  it('すべてのロケールに表示名がある', () => {
    for (const locale of LOCALES) {
      expect(LOCALE_LABELS[locale]).toBeTruthy()
    }
  })
})
