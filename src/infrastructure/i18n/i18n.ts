/**
 * 軽量な多言語対応。UI ラベルのみを翻訳し、曲名・会場名などのデータは
 * dataset 側の LocalizedText に任せる。
 */

import { en } from './locales/en'
import { ja, type TranslationKey, type Translations } from './locales/ja'
import { ko } from './locales/ko'
import { zhHant } from './locales/zh-Hant'

export const LOCALES = ['ja', 'en', 'zh-Hant', 'ko'] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  ja: '日本語',
  en: 'English',
  'zh-Hant': '繁體中文',
  ko: '한국어',
}

const TRANSLATIONS: Record<Locale, Translations> = {
  ja,
  en,
  'zh-Hant': zhHant,
  ko,
}

export type { TranslationKey }

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/** ブラウザの言語設定から対応ロケールを推定する。 */
export function detectLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    if (isLocale(language)) return language
    const base = language.split('-')[0]
    if (base === 'ja') return 'ja'
    if (base === 'ko') return 'ko'
    if (base === 'zh') return 'zh-Hant'
    if (base === 'en') return 'en'
  }
  return 'ja'
}

export type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string

/** {name} 形式のプレースホルダを差し込む翻訳関数を作る。 */
export function createTranslate(locale: Locale): Translate {
  const table = TRANSLATIONS[locale]
  return (key, params) => {
    const template = table[key] ?? ja[key]
    if (params === undefined) return template
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match,
    )
  }
}
