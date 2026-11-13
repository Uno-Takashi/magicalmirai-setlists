/**
 * 失敗しても例外を投げない localStorage の読み書き。
 *
 * プライベートウィンドウや容量超過、サイトデータの拒否などで localStorage は
 * 読み書きのどちらにも失敗しうる。ここに置くのは表示言語・見た目の好み・
 * お気に入りといった補助的な情報だけなので、失敗しても既定値で画面を続ける。
 */

/** 保存されている値。無い・読めないときは null。 */
export function readStoredItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/** 保存する。失敗してもその場の操作は続けるので、結果は返さない。 */
export function writeStoredItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // 保存できなくても表示は続行する
  }
}
