/**
 * シンプルなデザインで表示する設定を localStorage に覚える。
 *
 * localStorage はブラウザとの境界なので React 側には持ち込まず、タグの省略表示
 * (`tagDisplay.ts`) と同じようにここへ閉じ込める。プライベートウィンドウなどでは
 * 読み書きに失敗することがあるが、表示上の好みでしかないので、失敗しても
 * 既定値のまま続行する。
 */

const STORAGE_KEY = 'mm-plain-design'

/** 前回の選択。保存が無い・読めない場合は既定 (開催回ごとの配色を出す) にする。 */
export function readPlainDesign(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function writePlainDesign(plain: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(plain))
  } catch {
    // 保存できなくても表示は続行する
  }
}
