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
 * 閉じたら、開く前に焦点があった要素 (開いたボタンなど) へ焦点を戻す。
 * 戻さないと焦点が body に落ち、キーボードや読み上げで使う人が現在地を見失う。
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
    const opener = document.activeElement
    window.addEventListener('keydown', onKeyDown)
    const unlock = lockBackgroundScroll()

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      unlock()
      // 開いた元の要素が画面に残っているときだけ戻す (年送りなどで消えていることがある)
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true })
    }
  }, [open])
}
