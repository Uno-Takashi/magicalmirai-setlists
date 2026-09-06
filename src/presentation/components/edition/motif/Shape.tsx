import { roundedPath, starVertices } from './motifGeometry'

/** 散らす形。年ごとにどれを使うかは散らし方の指定 (`kinds`) で決める。 */
export type ShapeKind = 'circle' | 'star' | 'triangle' | 'diamond'

const TRIANGLE_POINTS = '50,12 84,76 16,76'
const DIAMOND_POINTS = '50,8 86,50 50,92 14,50'

/**
 * 丸みのある星。
 *
 * 0.45 まで丸めると星というより花に見えたので、角が取れたと分かる程度に留める。
 */
const STAR_PATH = roundedPath(starVertices(42, 18), 0.2)

/**
 * 図形 1 つ。線の色は呼ぶ側の currentColor に従う。
 *
 * 角の丸めは stroke-linejoin="round" で行う。線を塗りと同じ色で重ねると、
 * 角だけが丸まった図形になる。角丸の頂点を path で書き起こすより短い。
 */
export function Shape({
  kind,
  outlined,
  lineWidth = 8,
  fillColor,
}: {
  kind: ShapeKind
  outlined: boolean
  /** 輪郭の太さ (viewBox は 100 四方)。ネオンは細いほど管らしく見える。 */
  lineWidth?: number
  /** 塗りつぶす色。省略すると線と同じ色になる。 */
  fillColor?: string
}) {
  const paint = {
    fill: outlined ? 'none' : (fillColor ?? 'currentColor'),
    stroke: 'currentColor',
    strokeWidth: outlined ? lineWidth : 10,
    strokeLinejoin: 'round' as const,
  }

  return (
    <svg viewBox="0 0 100 100" aria-hidden focusable="false" className="w-full">
      {kind === 'circle' ? <circle cx="50" cy="50" r="40" {...paint} /> : null}
      {kind === 'star' ? (
        <>
          <path d={STAR_PATH} {...paint} />
          {/*
            星は二重にする。原点で半分に縮めてから中心へ寄せると、外側の星と
            中心が揃う。線の太さも一緒に縮むので、内側は自然と細くなる。
          */}
          <path d={STAR_PATH} transform="translate(25 25) scale(0.5)" {...paint} />
        </>
      ) : null}
      {kind === 'triangle' ? <polygon points={TRIANGLE_POINTS} {...paint} /> : null}
      {kind === 'diamond' ? <polygon points={DIAMOND_POINTS} {...paint} /> : null}
    </svg>
  )
}
