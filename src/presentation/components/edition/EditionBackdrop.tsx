import type { CSSProperties } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { EditionMotifArt } from './EditionMotifArt'
import type { EditionTheme } from './editionThemes'

/** 色を薄める。左右に浮かべるときは、地色が透けるくらいまで引く。 */
const veil = (color: string) => `color-mix(in srgb, ${color} 55%, transparent)`

/**
 * 色の敷き方。
 *
 * どちらも上から 60rem までで敷き終える。高さいっぱいに引き伸ばすと、曲数の
 * 多い年ほど変化が薄まって単色に見える。
 *
 * - `gradient`: 上から下へ流し、敷き終わりから下は最後の色で塗る
 * - `sides`: 左右の端にうっすら浮かべる。真ん中と下は素の地色のまま残す
 * - `spotlight`: 最後の色で塗りつぶし、上から光を当てる
 */
function backdropStyle(theme: EditionTheme): CSSProperties {
  const common = { backgroundSize: '100% 60rem', backgroundRepeat: 'no-repeat' } as const

  if (theme.layout === 'spotlight') {
    return {
      ...common,
      backgroundColor: theme.colors[theme.colors.length - 1],
      // 白を薄く 2 枚重ねる。1 枚だと光の縁がはっきり出て、輪郭のある円に見える
      backgroundImage: [
        'radial-gradient(64rem 22rem at 50% -4rem, rgb(255 255 255 / 0.16), transparent 70%)',
        'radial-gradient(34rem 34rem at 50% -8rem, rgb(255 255 255 / 0.10), transparent 72%)',
      ].join(', '),
    }
  }

  if (theme.layout === 'sides') {
    const left = theme.colors[0]
    const right = theme.colors[theme.colors.length - 1]!
    return {
      ...common,
      backgroundImage: [
        `radial-gradient(52rem 44rem at -12% 18%, ${veil(left)}, transparent 64%)`,
        `radial-gradient(52rem 44rem at 112% 42%, ${veil(right)}, transparent 64%)`,
      ].join(', '),
    }
  }

  return {
    ...common,
    backgroundColor: theme.colors[theme.colors.length - 1],
    backgroundImage: `linear-gradient(to bottom, ${theme.colors.join(', ')})`,
  }
}

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
        ...backdropStyle(theme),
        // 下端は脚注の地色へ溶かす。敷き終わりに横線が出ないようにする。
        maskImage: 'linear-gradient(to bottom, #000 calc(100% - 6rem), transparent)',
      }}
    >
      {theme.motif !== undefined ? <EditionMotifArt motif={theme.motif} /> : null}
    </motion.div>
  )
}
