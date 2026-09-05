import { motion, useReducedMotion } from 'motion/react'
import { EditionMotifArt } from './EditionMotifArt'
import type { EditionTheme } from './editionThemes'

/** 出るときは少し長く。地色から浮かび上がるのを見せる。 */
const FADE_IN = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const

/** 引くときは短く。次の年の色を待たせない。 */
const FADE_OUT = { duration: 0.18, ease: 'easeOut' } as const

const NO_MOTION = { duration: 0 } as const

/**
 * 開催回の背景。その年の色を敷き、モチーフがあれば薄く散らす。
 *
 * 年送りのときは横に滑らせず、いったん地色まで引いてから次の年の色を出す
 * (`EditionPage` の `AnimatePresence` が exit → enter の順で繋ぐ)。2 つの色が
 * 横に並んで流れると、境目で色が濁って見えるため。
 *
 * 中身より先に描かれるだけで、z-index は使わない (本文側が `relative` なので
 * そのまま上に乗る)。読み上げからは外す。色も飾りで、文字の情報を足さない。
 */
export function EditionBackdrop({ theme }: { theme: EditionTheme }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: reduceMotion ? NO_MOTION : FADE_IN }}
      exit={{ opacity: 0, transition: reduceMotion ? NO_MOTION : FADE_OUT }}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        // 色の移り変わりは上から 60rem までで終わらせ、その先は最後の色で塗る。
        // 高さいっぱいに引き伸ばすと、曲数の多い年ほど変化が薄まって単色に見える。
        backgroundColor: theme.colors[theme.colors.length - 1],
        backgroundImage: `linear-gradient(to bottom, ${theme.colors.join(', ')})`,
        backgroundSize: '100% 60rem',
        backgroundRepeat: 'no-repeat',
        // 下端は脚注の地色へ溶かす。敷き終わりに横線が出ないようにする。
        maskImage: 'linear-gradient(to bottom, #000 calc(100% - 6rem), transparent)',
      }}
    >
      {theme.motif !== undefined ? <EditionMotifArt motif={theme.motif} /> : null}
    </motion.div>
  )
}
