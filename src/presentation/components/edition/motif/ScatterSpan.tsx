import type { CSSProperties, ReactNode } from 'react'
import type { ScatterItem } from './motifGeometry'

/**
 * 散らした 1 つを置く。どのモチーフも同じ入れ子で並べるので、ここにまとめる。
 *
 * **傾きは外側の span、揺れは内側の span に分ける。** 同じ要素に重ねると、
 * 揺れの transform が傾きを上書きしてしまう。
 *
 * `left` は図形の中心なので translate で半分戻す。戻さないと、大きい図形ほど
 * 右へはみ出して散らばりの重心が右に寄る。
 */
export function ScatterSpan({
  item,
  className,
  width,
  style,
  children,
}: {
  item: ScatterItem<string>
  className?: string
  /** 幅の上書き (px)。省略すると散らし方が決めた大きさをそのまま使う。 */
  width?: number
  /** 外側に足すスタイル。傾きや光の滲みはモチーフごとに違う。 */
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <span
      className={className === undefined ? 'absolute' : `absolute ${className}`}
      style={{
        left: item.left,
        top: item.top,
        width: `${width ?? item.size}px`,
        translate: '-50% 0',
        opacity: item.opacity,
        ...style,
      }}
    >
      <span className="block" style={{ animation: item.animation }}>
        {children}
      </span>
    </span>
  )
}
