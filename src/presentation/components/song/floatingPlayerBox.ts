/**
 * 疑似ピクチャーインピクチャーの箱の置き場所。
 *
 * React の外で位置を直に書き換える。動画の iframe は親要素を移すと読み込み直しに
 * なるため、DOM 上の位置は変えずに座標だけを毎フレーム合わせる必要がある。
 */

/** 右下に出すときの寸法 (px)。幅は画面が狭ければ縮める。 */
const MINI_WIDTH = 320
const MINI_MARGIN = 16
/** 曲名と操作ボタンを載せる帯の高さ。右下のときだけ足す。 */
const MINI_BAR = 28

export interface Rect {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

/** 右下に縮めたときの位置と大きさ。 */
export function miniRect(): Rect {
  const width = Math.min(MINI_WIDTH, window.innerWidth - MINI_MARGIN * 2)
  const height = Math.round((width * 9) / 16) + MINI_BAR
  return {
    left: window.innerWidth - MINI_MARGIN - width,
    top: window.innerHeight - MINI_MARGIN - height,
    width,
    height,
  }
}

export function place(box: HTMLElement, rect: Rect): void {
  box.style.left = `${rect.left}px`
  box.style.top = `${rect.top}px`
  box.style.width = `${rect.width}px`
  box.style.height = `${rect.height}px`
}

/** 右下へ滑って戻るときの動き。 */
export const SLIDE_TRANSITION = ['left', 'top', 'width', 'height']
  .map((property) => `${property} 320ms cubic-bezier(0.22, 1, 0.36, 1)`)
  .join(', ')
