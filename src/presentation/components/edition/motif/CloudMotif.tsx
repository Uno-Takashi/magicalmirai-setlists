import { cloudPuffs, createScatter, type CloudPuff } from './motifGeometry'
import { ScatterSpan } from './ScatterSpan'

const CLOUD_SHAPES = Array.from({ length: 9 }, (_, index) => cloudPuffs(index))

/** 雲 1 つ。丸の集まりを白で塗るだけで、輪郭線は持たない。 */
function Cloud({ puffs }: { puffs: readonly CloudPuff[] }) {
  return (
    <svg viewBox="0 0 120 60" aria-hidden focusable="false" className="w-full" fill="#ffffff">
      <ellipse cx="60" cy="44" rx="50" ry="11" />
      {puffs.map(({ cx, cy, r }, index) => (
        <circle key={index} cx={cx} cy={cy} r={r} />
      ))}
    </svg>
  )
}

/**
 * 2021: 雲を空の高いところに散らす。
 *
 * 下へ行くほど地の色が白に抜けるので、白い雲は見えなくなる。青が残っている
 * あいだに収める。
 */
const CLOUDS = createScatter({
  count: CLOUD_SHAPES.length,
  seed: 20210301,
  kinds: ['cloud'] as const,
  size: [220, 520],
  outlinedRate: 0,
  opacity: [0.38, 0.72],
  depth: 28,
  from: 2,
})

/**
 * 2021: 雲を並べる。雲は回さない。傾けると空に浮かんで見えなくなる。
 *
 * 縁は 2 段でぼかす。大きさに合わせた blur で丸の継ぎ目を消し、さらに外へ向けて
 * 透けさせて、輪郭がどこで終わるのか分からないようにする。
 */
export function CloudMotif() {
  return (
    <>
      {CLOUDS.map((item, index) => (
        <ScatterSpan
          key={index}
          item={item}
          style={{
            filter: `blur(${item.size / 44}px)`,
            maskImage: 'radial-gradient(closest-side, #000 55%, transparent 100%)',
          }}
        >
          <Cloud puffs={CLOUD_SHAPES[index]!} />
        </ScatterSpan>
      ))}
    </>
  )
}
