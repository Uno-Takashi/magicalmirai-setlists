/**
 * 表示言語の永続化とブラウザ設定の読み取り。
 *
 * localStorage と navigator はブラウザとの境界なので、React 側には持ち込まず
 * ここに閉じ込める。
 */

import { readStoredItem, writeStoredItem } from '@/infrastructure/storage/safeLocalStorage'
import { detectLocale, isLocale, type Locale } from './i18n'

const STORAGE_KEY = 'mm-locale'

export function writeStoredLocale(locale: Locale): void {
  writeStoredItem(STORAGE_KEY, locale)
}

/** 最初に表示する言語。保存された選択を優先し、無ければブラウザの設定から推定する。 */
export function preferredLocale(): Locale {
  const stored = readStoredItem(STORAGE_KEY)
  if (stored !== null && isLocale(stored)) return stored
  return detectLocale(navigator.languages)
}
