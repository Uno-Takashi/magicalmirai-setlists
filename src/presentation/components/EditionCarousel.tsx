import { AnimatePresence, motion, type PanInfo, type Variants } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { EditionEntry } from '@/domain/catalog/Catalog'
import type { Song } from '@/domain/song/Song'
import { EditionView } from '@/presentation/components/EditionView'

/** 年の送り方向に合わせて左右からスライドさせる。 */
const slide: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 64 : -64 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -64 : 64 }),
}

/** これ以上引っ張るか、これ以上の速さで放すと年を切り替える。 */
const DRAG_DISTANCE = 90
const DRAG_VELOCITY = 450

export function EditionCarousel({
  entry,
  direction,
  focusSong,
  canGoNewer,
  canGoOlder,
  onNewer,
  onOlder,
  onSelectSong,
  onFocusHandled,
}: {
  entry: EditionEntry
  /** 表示順で後ろへ動いたら 1、前へ動いたら -1。 */
  direction: number
  focusSong?: string | null
  canGoNewer: boolean
  canGoOlder: boolean
  onNewer: () => void
  onOlder: () => void
  onSelectSong: (song: Song) => void
  onFocusHandled?: () => void
}) {
  const [dragging, setDragging] = useState(false)
  // 1 回のドラッグで年が 2 つ進まないようにする門。切り替えの間だけ立てる。
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
      }, 300)
    },
    [canGoNewer, canGoOlder, onNewer, onOlder],
  )

  return (
    <div className="relative flex-1 overflow-hidden">
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={entry.edition.slug}
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
          <EditionView
            entry={entry}
            focusSong={focusSong}
            onSelectSong={onSelectSong}
            onFocusHandled={onFocusHandled}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
