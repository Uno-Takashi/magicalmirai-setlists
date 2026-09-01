import { useLayoutEffect, useRef, type RefObject } from 'react'
import { miniRect, place, SLIDE_TRANSITION } from '@/presentation/components/song/floatingPlayerBox'

/**
 * 動画の箱を、貸してもらった場所と画面の右下との間で行き来させる。
 *
 * 貸してもらっている間は毎フレーム重ね続ける (曲の詳細が出入りするアニメーションに
 * 追従させるため)。場所が返ってきたら、いま居る位置から右下へ滑らせる。
 *
 * @param slot 重ねる先の要素。null なら右下に置く。
 * @param key  中身が入れ替わる目印。曲が変わったら置き直す。
 */
export function useFloatingPlayerBox(
  slot: HTMLElement | null,
  key: string | undefined,
): RefObject<HTMLDivElement | null> {
  const boxRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const box = boxRef.current
    if (box === null) return

    if (slot !== null) {
      box.style.transition = 'none'
      let frameId = 0
      const follow = () => {
        place(box, slot.getBoundingClientRect())
        frameId = requestAnimationFrame(follow)
      }
      follow()
      return () => cancelAnimationFrame(frameId)
    }

    box.style.transition = SLIDE_TRANSITION
    const toCorner = () => place(box, miniRect())
    toCorner()
    window.addEventListener('resize', toCorner)
    return () => window.removeEventListener('resize', toCorner)
  }, [slot, key])

  return boxRef
}
