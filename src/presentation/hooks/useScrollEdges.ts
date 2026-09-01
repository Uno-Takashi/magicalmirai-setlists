import { useCallback, useLayoutEffect, useState, type RefObject } from 'react'

/** 横スクロールの、まだ見えていない側。端のフェードを出すかどうかに使う。 */
export interface ScrollEdges {
  readonly start: boolean
  readonly end: boolean
}

/**
 * 横スクロールする要素の、両端に続きがあるかどうかを測る。
 *
 * スクロール中は 1 フレームごとに呼ばれるので、値が変わらないかぎり同じ
 * オブジェクトを返して再描画を起こさない。幅の変化にも追従させるため
 * `ResizeObserver` も張る (中身が増えても初期表示から正しく測れる)。
 *
 * @returns 端の状態と、`onScroll` に渡す測り直しの関数。
 */
export function useScrollEdges(
  ref: RefObject<HTMLElement | null>,
  // 中身が入れ替わったら測り直す。要素の数など、幅が変わりうる値を渡す。
  deps: unknown,
): [ScrollEdges, () => void] {
  const [edges, setEdges] = useState<ScrollEdges>({ start: false, end: false })

  const measure = useCallback(() => {
    const element = ref.current
    if (element === null) return
    const max = element.scrollWidth - element.clientWidth
    const start = element.scrollLeft > 1
    const end = element.scrollLeft < max - 1
    setEdges((current) =>
      current.start === start && current.end === end ? current : { start, end },
    )
  }, [ref])

  useLayoutEffect(() => {
    const element = ref.current
    if (element === null) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, measure, deps])

  return [edges, measure]
}
