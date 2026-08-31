import { useEffect, useEffectEvent } from 'react'

/**
 * 開いているオーバーレイの数。検索の上に曲の詳細を重ねられるので、
 * 最後の 1 つが閉じるまで背面のスクロールを止め続ける必要がある。
 */
let openCount = 0
let restoreOverflow = ''

function lockBackgroundScroll(): () => void {
  if (openCount === 0) {
    restoreOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  openCount += 1

  return () => {
    openCount -= 1
    if (openCount === 0) document.body.style.overflow = restoreOverflow
  }
}

/**
 * モーダル共通のふるまい。Escape で閉じ、開いている間は背面をスクロールさせない。
 *
 * onClose は呼び出し側で毎描画作り直されることが多い。依存に入れると無関係な
 * 再描画のたびに購読を張り直すことになるので、useEffectEvent で包んで最新の
 * 実装だけを効果の中から呼ぶ。
 */
export function useOverlay(open: boolean, onClose: () => void): void {
  const close = useEffectEvent(() => {
    onClose()
  })

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    const unlock = lockBackgroundScroll()

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      unlock()
    }
  }, [open])
}
