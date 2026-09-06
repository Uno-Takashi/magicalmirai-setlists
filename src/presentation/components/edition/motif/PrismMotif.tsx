import { createScatter, prismCube } from './motifGeometry'
import { CubeShell, FloatingCube } from './CubeShell'

const PRISM_PIECES = Array.from({ length: 16 }, (_, index) => prismCube(index))

/** 2017 の面。三角形を半透明で重ね、重なったところを濃く見せる。 */
function PrismCube({ pieces }: { pieces: { points: string; color: string }[] }) {
  return (
    <CubeShell>
      {pieces.map(({ points, color }, index) => (
        <polygon key={index} points={points} fill={color} fillOpacity="0.5" />
      ))}
    </CubeShell>
  )
}

/** 2017: 三角形を重ねた立方体を散らす。 */
const PRISMS = createScatter({
  count: PRISM_PIECES.length,
  seed: 20170826,
  kinds: ['prism'] as const,
  size: [60, 190],
  outlinedRate: 0,
  opacity: [0.7, 1],
  depth: 46,
  from: 3,
})

/** 2017: 三角形を重ねた立方体を散らす。 */
export function PrismMotif() {
  return (
    <>
      {PRISMS.map((item, index) => (
        <FloatingCube key={index} item={item}>
          <PrismCube pieces={PRISM_PIECES[index % PRISM_PIECES.length]!} />
        </FloatingCube>
      ))}
    </>
  )
}
