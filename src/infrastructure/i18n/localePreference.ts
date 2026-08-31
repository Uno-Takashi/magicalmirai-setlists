/**
 * 表示言語の永続化とブラウザ設定の読み取り。
 *
 * localStorage と navigator はブラウザとの境界なので、React 側には持ち込まず
 * ここに閉じ込める。プライベートウィンドウなどでは読み書きに失敗することが
 * あるが、言語は表示上の好みでしかないので、失敗しても既定値で続行する。
 */

import { detectLocale, isLocale, type Locale } from './i18n'

const STORAGE_KEY = 'mm-locale'

/** 前回選んだ言語。保存が無い・読めない場合は undefined。 */
function readStoredLocale(): Locale | undefined {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored !== null && isLocale(stored) ? stored : undefined
  } catch {
    return undefined
  }
}

export function writeStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // 保存できなくても表示は続行する
  }
}

/** 最初に表示する言語。保存された選択を優先し、無ければブラウザの設定から推定する。 */
export function preferredLocale(): Locale {
  return readStoredLocale() ?? detectLocale(navigator.languages ?? [navigator.language])
}
