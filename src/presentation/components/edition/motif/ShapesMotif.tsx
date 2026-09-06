import { createScatter } from './motifGeometry'
import { ScatterSpan } from './ScatterSpan'
import { Shape } from './Shape'

/** 2024: 星・丸・角丸の三角を薄く散らす。 */
const SHAPES = createScatter({
  count: 22,
  seed: 20240809,
  kinds: ['circle', 'star', 'triangle'],
  size: [56, 172],
  outlinedRate: 0.4,
  opacity: [0.2, 0.5],
  depth: 48,
})

/** 2024: 図形を薄く散らす。 */
export function ShapesMotif() {
  return (
    <>
      {SHAPES.map((item, index) => (
        <ScatterSpan
          key={index}
          item={item}
          className="text-white"
          style={{ rotate: `${item.rotate}deg` }}
        >
          <Shape kind={item.kind} outlined={item.outlined} />
        </ScatterSpan>
      ))}
    </>
  )
}
