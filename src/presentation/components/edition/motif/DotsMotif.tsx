import { createScatter, DOT_KINDS, dotsOf, type DotKind } from './motifGeometry'
import { ScatterSpan } from './ScatterSpan'

const DOT_SHAPES = Object.fromEntries(DOT_KINDS.map((kind) => [kind, dotsOf(kind)])) as Record<
  DotKind,
  { x: number; y: number }[]
>

/**
 * 点で描いた図形。小さい丸を格子に並べて、四角形や三角形の形を表す。
 *
 * 面で塗らずに点の集まりにすると、暗い地の上でも重くならない。
 */
function DotShape({ kind, color }: { kind: DotKind; color: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden focusable="false" className="w-full" fill={color}>
      {DOT_SHAPES[kind].map(({ x, y }, index) => (
        <circle key={index} cx={x} cy={y} r="7" />
      ))}
    </svg>
  )
}

/** 2019: 点で描いた図形を散らす。 */
const DOT_FIGURES = createScatter({
  count: 9,
  seed: 20191004,
  kinds: DOT_KINDS,
  size: [70, 150],
  outlinedRate: 0,
  opacity: [0.45, 0.85],
  depth: 46,
  from: 4,
})

/** 点で描いた図形の色。暗い紺の地に沈まない程度に明るくする。 */
const DOT_COLOR = '#484965'

/** 2019: 点で描いた図形を並べる。 */
export function DotsMotif() {
  return (
    <>
      {DOT_FIGURES.map((item, index) => (
        <ScatterSpan key={index} item={item} style={{ rotate: `${item.rotate}deg` }}>
          <DotShape kind={item.kind} color={DOT_COLOR} />
        </ScatterSpan>
      ))}
    </>
  )
}
