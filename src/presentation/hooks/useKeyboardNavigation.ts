import { useEffect, useEffectEvent } from 'react'

/** 入力を受け付ける要素。ここで矢印キーを奪うと、カーソル移動ができなくなる。 */
const EDITABLE = 'input, textarea, select, [contenteditable="true"]'

/** ← → キーで年を切り替える。入力欄にフォーカスがあるときは無効。 */
export function useKeyboardNavigation(onPrevious: () => void, onNext: () => void): void {
  // 受け取る関数は現在地が変わるたびに作り直される。購読は 1 度だけ張り、
  // 押されたときに最新の関数を呼ぶ。
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (event.target instanceof Element && event.target.closest(EDITABLE)) return

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      onPrevious()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      onNext()
    }
  })

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
