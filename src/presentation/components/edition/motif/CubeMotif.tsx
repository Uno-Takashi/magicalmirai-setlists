import { createScatter, cubePieces } from './motifGeometry'
import { CubeShell, FloatingCube } from './CubeShell'

/**
 * 面に置く色。1 つの立方体で 4 色を使い回し、割った破片へ順に配る。
 *
 * 白と橙を交ぜ、全体に淡くする。破片どうしは線を挟まず色で直に接するので、
 * 色相さえ離れていれば、薄くても切ったところは見える。
 */
const CUBE_TONES: (readonly string[])[] = [
  ['#FFFFFF', '#FFD3A8', '#BFE9FF', '#FFD9EE'],
  ['#FFE7CC', '#FFFFFF', '#D7CCFF', '#C9F6FF'],
  ['#FFFFFF', '#FFC9A3', '#CFF7E4', '#FFE9A8'],
  ['#E3F4FF', '#FFFFFF', '#FFDCC2', '#F3D6FF'],
]

/** 2018 の面。割った破片を単色で敷き詰める。 */
function Cube({ pieces, tones }: { pieces: string[]; tones: readonly string[] }) {
  return (
    <CubeShell>
      {pieces.map((points, index) => {
        const color = tones[index % tones.length]
        return (
          /*
            線は色と同じにする。塗りだけだと、隣り合う破片のあいだに地の色が
            細く覗く。白い線を挟むと、そこが切れ目ではなく縁取りに見える。
          */
          <polygon
            key={index}
            points={points}
            fill={color}
            stroke={color}
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        )
      })}
    </CubeShell>
  )
}

/** 立方体ごとの割り方。数と同じだけ先に作っておく。 */
const CUBE_PIECES = Array.from({ length: 20 }, (_, index) => cubePieces(index))

/** 2018: 立方体を散らす。 */
const CUBES = createScatter({
  count: 20,
  seed: 20180810,
  kinds: ['cube'] as const,
  size: [46, 120],
  outlinedRate: 0,
  opacity: [0.75, 1],
  depth: 46,
  from: 3,
})

/** 2018: きらきらした立方体を散らす。 */
export function CubeMotif() {
  return (
    <>
      {CUBES.map((item, index) => (
        <FloatingCube key={index} item={item}>
          <Cube
            pieces={CUBE_PIECES[index % CUBE_PIECES.length]!}
            tones={CUBE_TONES[index % CUBE_TONES.length]!}
          />
        </FloatingCube>
      ))}
    </>
  )
}
