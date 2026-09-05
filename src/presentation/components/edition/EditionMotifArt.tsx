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

/**
 * 種を固定した擬似乱数。散らし方を決めるのに使う。
 *
 * 描き直すたびに散らばりが変わると、年を送って戻っただけで別の絵になってしまう。
 * 種から決めておけば、いつ描いても同じ並びになる。
 */
function createRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648
    return value / 2147483648
  }
}

/**
 * 星の散らし方。位置と瞬きの拍を数として持ち、白い丸で描く。
 *
 * 縦は rem で置く。割合にすると、曲数の多い年ほど星が下の明るいところまで
 * 伸びて見えなくなる。色が濃紺から水色に変わりきるまでの範囲に留める。
 */
function createStars(count: number) {
  const random = createRandom(20250808)

  return Array.from({ length: count }, () => ({
    left: `${random() * 100}%`,
    // 上ほど密にする。地の色が濃いところに寄せると夜空らしくなる
    top: `${random() ** 1.7 * 52}rem`,
    size: `${1.5 + random() * 2}px`,
    animation: `twinkle ${3 + random() * 4}s ease-in-out ${-random() * 6}s infinite`,
  }))
}

const STARS = createStars(140)

/**
 * 散らす形。角は丸める。
 *
 * 丸めは stroke-linejoin="round" で行う。線を塗りと同じ色で太く重ねると、
 * 角だけが丸まった一回り大きい図形になる。角丸の頂点を path で書き起こすより短い。
 */
/** 散らす形。年ごとにどれを使うかは散らし方の指定 (`kinds`) で決める。 */
type ShapeKind = 'circle' | 'star' | 'triangle' | 'diamond'

const STAR_POINTS =
  '50.0,8.0 60.0,36.2 89.9,37.0 66.2,55.3 74.7,84.0 50.0,67.0 25.3,84.0 33.8,55.3 10.1,37.0 40.0,36.2'
const TRIANGLE_POINTS = '50,12 84,76 16,76'
const DIAMOND_POINTS = '50,8 86,50 50,92 14,50'

/**
 * 図形 1 つ。色は呼ぶ側の currentColor に従う。
 *
 * 角の丸めは stroke-linejoin="round" で行う。線を塗りと同じ色で重ねると、
 * 角だけが丸まった図形になる。角丸の頂点を path で書き起こすより短い。
 */
function Shape({
  kind,
  outlined,
  lineWidth = 8,
}: {
  kind: ShapeKind
  outlined: boolean
  /** 輪郭の太さ (viewBox は 100 四方)。ネオンは細いほど管らしく見える。 */
  lineWidth?: number
}) {
  const paint = {
    fill: outlined ? 'none' : 'currentColor',
    stroke: 'currentColor',
    strokeWidth: outlined ? lineWidth : 10,
    strokeLinejoin: 'round' as const,
  }

  return (
    <svg viewBox="0 0 100 100" aria-hidden focusable="false" className="w-full">
      {kind === 'circle' ? <circle cx="50" cy="50" r="40" {...paint} /> : null}
      {kind === 'star' ? <polygon points={STAR_POINTS} {...paint} /> : null}
      {kind === 'triangle' ? <polygon points={TRIANGLE_POINTS} {...paint} /> : null}
      {kind === 'diamond' ? <polygon points={DIAMOND_POINTS} {...paint} /> : null}
    </svg>
  )
}

/** 散らし方の指定。年ごとに違うのはこの数値だけ。 */
interface ScatterSpec {
  readonly count: number
  /** 乱数の種。年ごとに変えて、同じ並びが繰り返されないようにする。 */
  readonly seed: number
  readonly kinds: readonly ShapeKind[]
  /** 大きさの下限と上限 (px)。 */
  readonly size: readonly [number, number]
  /** 輪郭だけで描く割合。1 なら全部が輪郭になる。 */
  readonly outlinedRate: number
  /** 濃さの下限と上限。 */
  readonly opacity: readonly [number, number]
  /** 縦に散らす範囲 (rem)。 */
  readonly depth: number
  /**
   * 上端をどれだけ空けるか (rem)。既定は 0。
   *
   * 大きくて明るい図形は、見出しに重なると文字を食う。ネオンのように光る年は
   * ここを空けて、題名の帯に掛からないようにする。
   */
  readonly from?: number
}

/**
 * 図形の散らし方。大きさ・傾き・濃さを 1 つずつずらす。
 *
 * 横は幅を図形の数で割った帯に 1 つずつ置き、帯の中で位置をずらす。まるごと
 * 乱数に任せると固まったり空いたりして、端の 1 つが浮いて見える。
 *
 * 星と同じく縦は rem で置き、地の色が濃いうちに収める。割合にすると、曲数の
 * 多い年ほど下の明るいところまで伸びて見えなくなる。
 */
function createScatter(spec: ScatterSpec) {
  const random = createRandom(spec.seed)
  const [minSize, maxSize] = spec.size
  const [minOpacity, maxOpacity] = spec.opacity

  return Array.from({ length: spec.count }, (_, index) => ({
    kind: spec.kinds[Math.floor(random() * spec.kinds.length)]!,
    outlined: random() < spec.outlinedRate,
    left: `${((index + random()) / spec.count) * 100}%`,
    top: `${(spec.from ?? 0) + random() ** 1.4 * spec.depth}rem`,
    size: `${minSize + random() * (maxSize - minSize)}px`,
    rotate: `${random() * 360}deg`,
    opacity: minOpacity + random() * (maxOpacity - minOpacity),
    animation: `drift ${18 + random() * 16}s ease-in-out ${-random() * 20}s infinite`,
  }))
}

type Scatter = ReturnType<typeof createScatter>

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

/** 2023: 星・三角・ひし形を白い線で描く。 */
const NEON = createScatter({
  count: 16,
  seed: 20230816,
  kinds: ['star', 'triangle', 'diamond'],
  size: [72, 208],
  outlinedRate: 1,
  opacity: [0.75, 1],
  depth: 48,
  // 狭い画面では題名が 2 行になる。その下から散らす
  from: 7,
})

/**
 * 赤いネオンの光。白い線を芯にして、赤い滲みを 3 段重ねる。
 *
 * 近いところは濃く、遠いところは広く薄く。1 段だけだと縁取りに見えて、
 * 光っているようにならない。
 */
const NEON_GLOW =
  'drop-shadow(0 0 3px #E50617) drop-shadow(0 0 10px #E50617) drop-shadow(0 0 26px #E50617)'

/** 散らした図形を並べる。光らせるときは glow に filter を渡す。 */
function ScatterField({
  shapes,
  glow,
  lineWidth,
}: {
  shapes: Scatter
  glow?: string
  lineWidth?: number
}) {
  return (
    <>
      {shapes.map(({ kind, outlined, left, top, size, rotate, opacity, animation }, index) => (
        /*
          傾きは外側に、揺れは内側に。同じ要素に重ねると、揺れの transform が
          傾きを上書きしてしまう。left は図形の中心なので translate で半分戻す。
          戻さないと、大きい図形ほど右へはみ出して散らばりの重心が右に寄る。
        */
        <span
          key={index}
          className="absolute text-white"
          style={{ left, top, width: size, translate: '-50% 0', rotate, opacity, filter: glow }}
        >
          <span className="block" style={{ animation }}>
            <Shape kind={kind} outlined={outlined} lineWidth={lineWidth} />
          </span>
        </span>
      ))}
    </>
  )
}

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

  if (motif === 'starfield') {
    return (
      <>
        {STARS.map(({ left, top, size, animation }, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-white"
            style={{ left, top, width: size, height: size, animation }}
          />
        ))}
      </>
    )
  }

  if (motif === 'shapes') {
    return <ScatterField shapes={SHAPES} />
  }

  if (motif === 'neon') {
    return <ScatterField shapes={NEON} glow={NEON_GLOW} lineWidth={5} />
  }

  return null
}
