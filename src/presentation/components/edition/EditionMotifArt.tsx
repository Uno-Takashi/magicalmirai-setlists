import type { CSSProperties } from 'react'
import type { EditionMotif } from './editionThemes'

/**
 * 開催回のモチーフの絵。背景に薄く散らす飾りで、意味は持たない。
 *
 * 絵は SVG で持つ。年ごとの画像を置くとその年だけ重くなるうえ、拡大したときに
 * 粗が出る。背景に薄く敷くだけなら図形で足りる。
 */

/** 花びらを回して並べる角度。外側 12 枚、内側はその間へ半歩ずらして 12 枚。 */
const OUTER_PETALS = Array.from({ length: 12 }, (_, index) => index * 30)
const INNER_PETALS = OUTER_PETALS.map((angle) => angle + 15)

/** ヒマワリ 1 輪。中心を (50,50) に置き、大きさと位置は呼ぶ側が決める。 */
function Sunflower({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden focusable="false" className={className} style={style}>
      {OUTER_PETALS.map((angle) => (
        <ellipse
          key={`outer-${angle}`}
          cx="50"
          cy="23"
          rx="7"
          ry="19"
          fill="#ffd23f"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
      {INNER_PETALS.map((angle) => (
        <ellipse
          key={`inner-${angle}`}
          cx="50"
          cy="30"
          rx="6"
          ry="15"
          fill="#f7b733"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="15" fill="#c98a2e" />
      <circle cx="50" cy="50" r="10" fill="#a3661d" />
    </svg>
  )
}

/**
 * ヒマワリの散らし方。
 *
 * 左右の端から覗かせる。広い画面では本文 (max-w-3xl) の外側の余白に収まり、
 * 狭い画面では端で切れて顔を出す。どちらでも文字の後ろには回り込まない。
 *
 * 縦は上下を固定寸法で、真ん中だけ割合で置く。セットリストの曲数で高さが
 * 何倍にも変わるので、全部を割合にすると短い年で 3 輪が固まってしまう。
 *
 * 揺れは index.css の `drift`。負の delay で途中から始めて、3 輪が同じ拍で
 * 動かないようにする。動きを減らす設定のときは index.css が止める。
 */
const SUNFLOWERS: { className: string; animation: string }[] = [
  {
    // 見出しの脇。狭い画面でも背景が見えるのはこの帯だけなので、1 輪はここに置く
    className:
      'absolute -top-8 -right-12 w-32 rotate-6 opacity-30 sm:top-8 sm:-right-16 sm:w-56 sm:blur-[1px]',
    animation: 'drift 26s ease-in-out infinite',
  },
  {
    className: 'absolute top-[45%] -left-16 w-52 -rotate-12 opacity-25 blur-[1px] sm:w-72',
    animation: 'drift 34s ease-in-out -9s infinite',
  },
  {
    className: 'absolute bottom-28 -right-8 w-28 -rotate-3 opacity-30 sm:w-36',
    animation: 'drift 21s ease-in-out -15s infinite',
  },
]

export function EditionMotifArt({ motif }: { motif: EditionMotif }) {
  if (motif === 'sunflower') {
    return (
      <>
        {SUNFLOWERS.map(({ className, animation }, index) => (
          /* 回転は外側に、揺れは内側に。同じ要素に重ねると、揺れの transform が
             回転を上書きして花の向きが揃ってしまう */
          <span key={index} aria-hidden className={className}>
            <Sunflower className="w-full" style={{ animation }} />
          </span>
        ))}
      </>
    )
  }
  return null
}
