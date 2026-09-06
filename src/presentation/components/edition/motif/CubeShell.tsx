import type { ReactNode } from 'react'
import { sparkle, type ScatterItem } from './motifGeometry'
import { ScatterSpan } from './ScatterSpan'

const CUBE_SPARKLES = [sparkle(50, 6, 11), sparkle(92, 30, 7)]

/**
 * 立方体の殻。光の粒だけを持ち、面の中身は呼ぶ側が描く。
 *
 * 年によって面の作り方が違う (2018 は単色の破片、2017 は半透明の三角形の重なり) が、
 * 立体の形と光り方は同じなので、外側だけを共通にする。
 */
export function CubeShell({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 100 104" aria-hidden focusable="false" className="w-full">
      {children}
      {/* 角で光が跳ねる。上と右の頂点にだけ置いて、光の向きを揃える */}
      {CUBE_SPARKLES.map((path, index) => (
        <path key={index} d={path} fill="#ffffff" fillOpacity={index === 0 ? 0.95 : 0.7} />
      ))}
    </svg>
  )
}

/**
 * 立方体の傾きの幅 (度)。
 *
 * 等角投影の絵なので、大きく回すと立体に見えなくなる。少しだけ傾けて、
 * 浮かんでいる向きの違いだけを出す。
 */
const CUBE_SPIN = 22

/**
 * 立方体を 1 つ浮かべる。白い光を添えて、きらきらして見せる。
 *
 * 2017 と 2018 は面の描き方だけが違い、浮かべ方は同じなのでここにまとめる。
 */
export function FloatingCube({
  item,
  children,
}: {
  item: ScatterItem<string>
  children: ReactNode
}) {
  return (
    <ScatterSpan
      item={item}
      style={{
        rotate: `${(item.rotate / 360) * CUBE_SPIN - CUBE_SPIN / 2}deg`,
        filter: 'drop-shadow(0 0 6px rgb(255 255 255 / 0.9))',
      }}
    >
      {children}
    </ScatterSpan>
  )
}
