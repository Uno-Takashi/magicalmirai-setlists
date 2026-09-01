/**
 * タグの省略表示の設定を localStorage に覚える。
 *
 * localStorage はブラウザとの境界なので React 側には持ち込まず、言語の設定
 * (`localePreference.ts`) と同じようにここへ閉じ込める。プライベートウィンドウ
 * などでは読み書きに失敗することがあるが、表示上の好みでしかないので、
 * 失敗しても既定値のまま続行する。
 */

const STORAGE_KEY = 'mm-compact-tags'

/** 前回の選択。保存が無い・読めない場合は既定 (省略しない) にする。 */
export function readCompactTags(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeCompactTags(compact: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(compact))
  } catch {
    // 保存できなくても表示は続行する
  }
}
