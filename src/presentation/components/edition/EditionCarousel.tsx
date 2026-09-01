import { AnimatePresence, motion, type PanInfo, type Variants } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

/** 年の送り方向に合わせて左右からスライドさせる。 */
const slide: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 64 : -64 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -64 : 64 }),
}

/** これ以上引っ張るか、これ以上の速さで放すと年を切り替える。 */
const DRAG_DISTANCE = 90
const DRAG_VELOCITY = 450

/** 1 回のドラッグで年が 2 つ進まないよう、切り替え後この時間だけ受け付けない。 */
const REOPEN_DELAY = 300

/**
 * 横スワイプで年を送る箱。中身が入れ替わると左右から滑り込む。
 *
 * 中身が何であるかは知らない。切り替わりの目印は `slideKey` で、これが変われば
 * 新しい面として出し直す。
 */
export function EditionCarousel({
  slideKey,
  direction,
  canGoNewer,
  canGoOlder,
  onNewer,
  onOlder,
  children,
}: {
  /** いま見せている面の目印。開催回の slug を渡す。 */
  slideKey: string
  /** 表示順で後ろへ動いたら 1、前へ動いたら -1。 */
  direction: number
  canGoNewer: boolean
  canGoOlder: boolean
  onNewer: () => void
  onOlder: () => void
  children: ReactNode
}) {
  const [dragging, setDragging] = useState(false)
  // 切り替えの間だけ立てる門。放した直後の慣性で二重に送られるのを防ぐ。
  const handled = useRef(false)
  const reopenTimer = useRef<number | undefined>(undefined)

  // 途中で年が切り替わってこの要素が消えても、タイマーを残さない
  useEffect(() => () => window.clearTimeout(reopenTimer.current), [])

  const onDragEnd = useCallback(
    (_event: unknown, info: PanInfo) => {
      setDragging(false)
      if (handled.current) return

      const passed =
        Math.abs(info.offset.x) > DRAG_DISTANCE || Math.abs(info.velocity.x) > DRAG_VELOCITY
      if (!passed) return

      // タブの並びと合わせる。右へ引いたら左隣 (新しい年)、左へ引いたら右隣 (古い年)。
      if (info.offset.x > 0 && canGoNewer) {
        handled.current = true
        onNewer()
      } else if (info.offset.x < 0 && canGoOlder) {
        handled.current = true
        onOlder()
      }
      window.clearTimeout(reopenTimer.current)
      reopenTimer.current = window.setTimeout(() => {
        handled.current = false
      }, REOPEN_DELAY)
    },
    [canGoNewer, canGoOlder, onNewer, onOlder],
  )

  return (
    <div className="relative flex-1 overflow-hidden">
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={slideKey}
          custom={direction}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          drag="x"
          dragElastic={0.16}
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={() => setDragging(true)}
          onDragEnd={onDragEnd}
          className={`h-full ${dragging ? 'cursor-grabbing select-none' : ''}`}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
