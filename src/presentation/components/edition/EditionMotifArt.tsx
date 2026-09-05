import { useId, type CSSProperties } from 'react'
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

const STARS = createStars(420)

/** 散らす形。年ごとにどれを使うかは散らし方の指定 (`kinds`) で決める。 */
type ShapeKind = 'circle' | 'star' | 'triangle' | 'diamond'

const TRIANGLE_POINTS = '50,12 84,76 16,76'
const DIAMOND_POINTS = '50,8 86,50 50,92 14,50'

type Point = readonly [number, number]

/** 星の頂点。外と内を交互に、真上から時計回りに 10 個。 */
function starVertices(outer: number, inner: number): Point[] {
  return Array.from({ length: 10 }, (_, index) => {
    const angle = ((-90 + index * 36) * Math.PI) / 180
    const radius = index % 2 === 0 ? outer : inner
    return [50 + radius * Math.cos(angle), 50 + radius * Math.sin(angle)]
  })
}

/**
 * 角を丸めた多角形の path。
 *
 * 各頂点の手前と先に辺の `roundness` だけ入った点を取り、頂点を制御点にした
 * 曲線で繋ぐ。0.5 にすると辺の真ん中どうしが繋がって、角が完全に取れる。
 *
 * stroke-linejoin="round" でも角は丸まるが、丸みが線の太さに比例するので、
 * ネオンのように細い線だと尖ったままになる。形そのものを丸めるとこれを避けられる。
 */
function roundedPath(points: readonly Point[], roundness: number): string {
  const lerp = (from: Point, to: Point): Point => [
    from[0] + (to[0] - from[0]) * roundness,
    from[1] + (to[1] - from[1]) * roundness,
  ]
  const at = ([x, y]: Point) => `${x.toFixed(1)} ${y.toFixed(1)}`

  return points
    .map((vertex, index) => {
      const previous = points[(index - 1 + points.length) % points.length]!
      const next = points[(index + 1) % points.length]!
      const head = `${index === 0 ? 'M' : 'L'}${at(lerp(vertex, previous))}`
      return `${head}Q${at(vertex)} ${at(lerp(vertex, next))}`
    })
    .join('')
    .concat('Z')
}

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
function Shape({
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

/**
 * 散らし方の指定。年ごとに違うのはこの数値だけ。
 *
 * 形の種類は総称にしてある。雲のように `Shape` を通さない絵でも、置き方だけは
 * 同じ仕組みに乗せられる。
 */
interface ScatterSpec<Kind extends string> {
  readonly count: number
  /** 乱数の種。年ごとに変えて、同じ並びが繰り返されないようにする。 */
  readonly seed: number
  readonly kinds: readonly Kind[]
  /** 大きさの下限と上限 (px)。 */
  readonly size: readonly [number, number]
  /** 輪郭だけで描く割合。1 なら全部が輪郭になる。 */
  readonly outlinedRate: number
  /** 濃さの下限と上限。 */
  readonly opacity: readonly [number, number]
  /** 縦に散らす範囲 (rem)。 */
  readonly depth: number
  /**
   * 視線に対する傾きの幅 (度)。省略すると画面と正対したままになる。
   *
   * 指定した年だけ乱数を余分に使う。既定のままの年は並びが変わらない。
   */
  readonly tilt?: number
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
function createScatter<Kind extends string>(spec: ScatterSpec<Kind>) {
  const random = createRandom(spec.seed)
  const [minSize, maxSize] = spec.size
  const [minOpacity, maxOpacity] = spec.opacity

  return Array.from({ length: spec.count }, (_, index) => ({
    kind: spec.kinds[Math.floor(random() * spec.kinds.length)]!,
    outlined: random() < spec.outlinedRate,
    left: `${((index + random()) / spec.count) * 100}%`,
    top: `${(spec.from ?? 0) + random() ** 1.4 * spec.depth}rem`,
    size: minSize + random() * (maxSize - minSize),
    rotate: random() * 360,
    opacity: minOpacity + random() * (maxOpacity - minOpacity),
    animation: `drift ${18 + random() * 16}s ease-in-out ${-random() * 20}s infinite`,
    // 奥へ倒す角度と、横へ振る角度
    tiltX: spec.tilt === undefined ? 0 : (random() - 0.5) * 2 * spec.tilt,
    tiltY: spec.tilt === undefined ? 0 : (random() - 0.5) * 2 * spec.tilt,
  }))
}

type Scatter<Kind extends string = ShapeKind> = ReturnType<typeof createScatter<Kind>>

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
  size: [120, 320],
  outlinedRate: 1,
  opacity: [0.75, 1],
  depth: 48,
  // 板を空中に浮かべたように、視線に対して少し斜めに構える
  tilt: 26,
  // 狭い画面では題名が 2 行になる。その下から散らす
  from: 7,
})

/**
 * ネオンの色。順に取り出して、隣り合う図形が同じ色にならないようにする。
 *
 * 乱数で選ぶと同じ色が固まって、色数があるように見えないことがある。
 */
const NEON_COLORS = ['#E50617', '#FF4FA3', '#FFD54A', '#39C5BB', '#7B5CFF']

/**
 * ネオンの形ごとの見せ方。大きさ・塗り・傾きの幅を形ごとに変える。
 *
 * ひし形だけは中を塗って小さくする。塗ると光の量が増えるので、輪郭の図形と
 * 同じ大きさでは背景を占めすぎる。
 */
const NEON_SHAPE = {
  // 二重の星は線が二本並ぶので、他より細くしないと光が固まって見える
  star: { filled: false, scale: 1, spin: 360, line: 2 },
  triangle: { filled: false, scale: 1, spin: 360, line: 5 },
  // ひし形は縦長なので、大きく回すと正方形に見えてしまう。少しだけ傾ける
  diamond: { filled: true, scale: 0.45, spin: 24, line: 5 },
  circle: { filled: false, scale: 1, spin: 360, line: 5 },
} as const satisfies Record<
  ShapeKind,
  { filled: boolean; scale: number; spin: number; line: number }
>

/**
 * ネオンの光。白い線を芯にして、色の滲みを 3 段重ねる。
 *
 * 近いところは濃く、遠いところは広く薄く。1 段だけだと縁取りに見えて、
 * 光っているようにならない。
 */
function neonGlow(color: string) {
  return `drop-shadow(0 0 3px ${color}) drop-shadow(0 0 10px ${color}) drop-shadow(0 0 26px ${color})`
}

/*
  以下の 2 つは、どちらも
  「傾きは外側の span、揺れは内側の span」に分けている。同じ要素に重ねると、
  揺れの transform が傾きを上書きしてしまうため。
  left は図形の中心なので translate で半分戻す。戻さないと、大きい図形ほど
  右へはみ出して散らばりの重心が右に寄る。
*/

/** 散らした図形を並べる。 */
function ScatterField({ shapes }: { shapes: Scatter }) {
  return (
    <>
      {shapes.map(({ kind, outlined, left, top, size, rotate, opacity, animation }, index) => (
        <span
          key={index}
          className="absolute text-white"
          style={{
            left,
            top,
            width: `${size}px`,
            translate: '-50% 0',
            rotate: `${rotate}deg`,
            opacity,
          }}
        >
          <span className="block" style={{ animation }}>
            <Shape kind={kind} outlined={outlined} />
          </span>
        </span>
      ))}
    </>
  )
}

/** 散らした図形をネオンにして並べる。線は白のまま、滲みだけ図形ごとに色を変える。 */
function NeonField({ shapes }: { shapes: Scatter }) {
  return (
    <>
      {shapes.map(({ kind, left, top, size, rotate, opacity, animation, tiltX, tiltY }, index) => {
        const color = NEON_COLORS[index % NEON_COLORS.length]!
        const { filled, scale, spin, line } = NEON_SHAPE[kind]

        return (
          <span
            key={index}
            className="absolute text-white"
            style={{
              left,
              top,
              width: `${size * scale}px`,
              translate: '-50% 0',
              // 0〜360 の傾きを、形ごとに許した幅へ畳み込む
              rotate: `${(rotate / 360) * spin - spin / 2}deg`,
              opacity,
              filter: neonGlow(color),
              /*
                遠近を付けてから前後に倒す。rotate (傾き) や translate とは別の
                プロパティなので、混ぜても打ち消し合わない。
              */
              transform: `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
            }}
          >
            <span className="block" style={{ animation }}>
              {/* 塗る形は色を敷いて、白い線で縁取る。管に色が入って見える */}
              <Shape kind={kind} outlined={!filled} lineWidth={line} fillColor={color} />
            </span>
          </span>
        )
      })}
    </>
  )
}

/**
 * 雲。大きさの違う丸をいくつも重ねて塊を作る。
 *
 * 形は 1 つずつ変える。同じ絵を並べると模様に見えて、空に浮かんでいる感じが出ない。
 * 種は雲の順番から決めるので、いつ描いても同じ空になる。
 */
function cloudPuffs(index: number) {
  const random = createRandom(20211015 + index * 977)
  const count = 7 + Math.floor(random() * 5)

  return Array.from({ length: count }, (_, puff) => {
    // 横は左から順に、間隔を少しずつ揺らして置く
    const along = (puff + 0.25 + random() * 0.5) / count
    const radius = 11 + random() * 15
    return {
      cx: 8 + along * 104,
      // 下は揃え、上へだけ膨らませる。積乱雲のように上が盛り上がって見える
      cy: 42 - radius * (0.3 + random() * 0.55),
      r: radius,
    }
  })
}

const CLOUD_SHAPES = Array.from({ length: 9 }, (_, index) => cloudPuffs(index))

/** 雲 1 つ。丸の集まりを白で塗るだけで、輪郭線は持たない。 */
function Cloud({ puffs }: { puffs: { cx: number; cy: number; r: number }[] }) {
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
 * 散らした雲を並べる。雲は回さない。傾けると空に浮かんで見えなくなる。
 *
 * 縁は 2 段でぼかす。大きさに合わせた blur で丸の継ぎ目を消し、さらに外へ向けて
 * 透けさせて、輪郭がどこで終わるのか分からないようにする。
 */
function CloudField({ clouds }: { clouds: Scatter<'cloud'> }) {
  return (
    <>
      {clouds.map(({ left, top, size, opacity, animation }, index) => (
        <span
          key={index}
          className="absolute"
          style={{
            left,
            top,
            width: `${size}px`,
            translate: '-50% 0',
            opacity,
            filter: `blur(${size / 44}px)`,
            maskImage: 'radial-gradient(closest-side, #000 55%, transparent 100%)',
          }}
        >
          <span className="block" style={{ animation }}>
            <Cloud puffs={CLOUD_SHAPES[index]!} />
          </span>
        </span>
      ))}
    </>
  )
}

/**
 * 提灯。2020 のテーマ「MATSURI」に合わせて、上から吊るす。
 *
 * 紐も同じ図に含める。別々に置くと、大きさを変えたときに紐の長さだけ合わなくなる。
 * viewBox の上を空けてあるので、幅を変えれば紐も一緒に伸び、大きい提灯ほど深く垂れる。
 *
 * 骨は楕円の内側に収まる長さで引く。横いっぱいに引くと角が飛び出して、
 * 紙を張った丸みが出ない。
 */
const LANTERN_RIBS = [
  { y: 42, half: 31.3 },
  { y: 54, half: 38.6 },
  { y: 66, half: 42.5 },
  { y: 78, half: 44.0 },
  { y: 90, half: 43.2 },
  { y: 102, half: 40.2 },
  { y: 114, half: 34.2 },
]

function Lantern({ body, cap }: { body: string; cap: string }) {
  return (
    <svg viewBox="0 -130 100 280" aria-hidden focusable="false" className="w-full">
      <line x1="50" y1="-130" x2="50" y2="20" stroke={cap} strokeWidth="2" strokeOpacity="0.5" />
      <rect x="34" y="18" width="32" height="9" rx="3" fill={cap} />
      <ellipse cx="50" cy="80" rx="44" ry="54" fill={body} />
      {LANTERN_RIBS.map(({ y, half }) => (
        <line
          key={y}
          x1={50 - half}
          y1={y}
          x2={50 + half}
          y2={y}
          stroke="#000000"
          strokeOpacity="0.12"
          strokeWidth="2"
        />
      ))}
      <rect x="38" y="128" width="24" height="8" rx="3" fill={cap} />
      <rect x="47" y="135" width="6" height="11" rx="3" fill={cap} />
    </svg>
  )
}

/** 提灯の紙と口輪の色。赤と生成りを交ぜる。 */
const LANTERN_RED = { body: '#ED3266', cap: '#7E1230' }
const LANTERN_CREAM = { body: '#F5EBEA', cap: '#B03354' }

/**
 * 提灯の吊るし方。本文の外側の余白に、左右から垂らす。
 *
 * 大きさだけを変えて、垂れる深さは図に任せる。狭い画面で出すのは端の 2 つだけ。
 * 背景が見えるのが題名の帯しかないので、内側まで並べると文字に重なる。
 */
const LANTERNS: { className: string; tone: typeof LANTERN_RED; animation: string }[] = [
  {
    className: 'absolute top-0 -left-7 w-20 sm:-left-4 sm:w-24',
    tone: LANTERN_RED,
    animation: 'sway 7s ease-in-out infinite',
  },
  {
    className: 'absolute top-0 left-16 hidden w-16 sm:block',
    tone: LANTERN_CREAM,
    animation: 'sway 9s ease-in-out -2s infinite',
  },
  {
    className: 'absolute top-0 left-36 hidden w-12 sm:block',
    tone: LANTERN_RED,
    animation: 'sway 8s ease-in-out -5s infinite',
  },
  {
    className: 'absolute top-0 -right-7 w-20 sm:-right-4 sm:w-24',
    tone: LANTERN_RED,
    animation: 'sway 8s ease-in-out -1s infinite',
  },
  {
    className: 'absolute top-0 right-16 hidden w-16 sm:block',
    tone: LANTERN_CREAM,
    animation: 'sway 10s ease-in-out -6s infinite',
  },
  {
    className: 'absolute top-0 right-36 hidden w-12 sm:block',
    tone: LANTERN_RED,
    animation: 'sway 7.5s ease-in-out -3s infinite',
  },
]

/** 吊るした提灯を並べる。揺れの軸は上端 (紐で吊るされているところ)。 */
function LanternField() {
  return (
    <>
      {LANTERNS.map(({ className, tone, animation }, index) => (
        <span key={index} className={className} style={{ opacity: 0.72 }}>
          <span className="block" style={{ animation, transformOrigin: '50% 0' }}>
            <Lantern body={tone.body} cap={tone.cap} />
          </span>
        </span>
      ))}
    </>
  )
}

/**
 * 点で描いた図形。小さい丸を格子に並べて、四角形や三角形の形を表す。
 *
 * 面で塗らずに点の集まりにすると、暗い地の上でも重くならない。
 */
const DOT_KINDS = ['grid', 'frame', 'triangle'] as const
type DotKind = (typeof DOT_KINDS)[number]

/** 5 行 5 列の格子。図形ごとに、どの目に丸を置くかだけを変える。 */
const DOT_STEPS = [0, 1, 2, 3, 4]

function dotsOf(kind: DotKind): { x: number; y: number }[] {
  const at = (column: number, row: number) => ({ x: 10 + column * 20, y: 10 + row * 20 })

  if (kind === 'frame') {
    // 外周だけ。中を抜くと四角形の輪郭として読める
    return DOT_STEPS.flatMap((row) =>
      DOT_STEPS.filter((column) => row === 0 || row === 4 || column === 0 || column === 4).map(
        (column) => at(column, row),
      ),
    )
  }

  if (kind === 'triangle') {
    // 行が下がるほど 1 つずつ増やし、中央に寄せる
    return DOT_STEPS.flatMap((row) =>
      Array.from({ length: row + 1 }, (_, index) => ({
        x: 50 + (index - row / 2) * 20,
        y: 10 + row * 20,
      })),
    )
  }

  return DOT_STEPS.flatMap((row) => DOT_STEPS.map((column) => at(column, row)))
}

const DOT_SHAPES = Object.fromEntries(DOT_KINDS.map((kind) => [kind, dotsOf(kind)])) as Record<
  DotKind,
  { x: number; y: number }[]
>

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

/** 点で描いた図形を並べる。 */
function DotField({ figures, color }: { figures: Scatter<DotKind>; color: string }) {
  return (
    <>
      {figures.map(({ kind, left, top, size, rotate, opacity, animation }, index) => (
        <span
          key={index}
          className="absolute"
          style={{
            left,
            top,
            width: `${size}px`,
            translate: '-50% 0',
            rotate: `${rotate}deg`,
            opacity,
          }}
        >
          <span className="block" style={{ animation }}>
            <DotShape kind={kind} color={color} />
          </span>
        </span>
      ))}
    </>
  )
}

/**
 * きらきらした立方体。等角投影で 3 面を見せ、面ごとに違う淡い色を流す。
 *
 * 面の色は 1 つずつずらして環になるようにする (上→左→右→上)。同じ組を
 * 使い回しても、面の並びが変わるだけで光り方が変わって見える。
 */
const CUBE_TOP = '50,6 92,30 50,54 8,30'
const CUBE_LEFT = '8,30 50,54 50,98 8,74'
const CUBE_RIGHT = '92,30 50,54 50,98 92,74'

/**
 * 光の粒。4 方向へ尖った星で、頂点で光が跳ねているように見せる。
 *
 * 制御点を中心に置くと辺がへこみ、尖りだけが残る。
 */
function sparkle(cx: number, cy: number, r: number): string {
  return [
    `M${cx},${cy - r}`,
    `Q${cx},${cy} ${cx + r},${cy}`,
    `Q${cx},${cy} ${cx},${cy + r}`,
    `Q${cx},${cy} ${cx - r},${cy}`,
    `Q${cx},${cy} ${cx},${cy - r}`,
    'Z',
  ].join('')
}

const CUBE_SPARKLES = [sparkle(50, 6, 11), sparkle(92, 30, 7)]

/** 面に流す淡い色。虹色に振れるよう、隣り合う色相を離して並べる。 */
const CUBE_TONES: (readonly [string, string, string])[] = [
  ['#FF9ED2', '#8FD8FF', '#FFF08A'],
  ['#B79BFF', '#7FEBFF', '#FFC199'],
  ['#7DF5C4', '#FFE86B', '#FF9CC8'],
  ['#63D6FF', '#C7A5FF', '#FFD27F'],
]

function Cube({ tones }: { tones: readonly [string, string, string] }) {
  // 面ごとにグラデーションを持つので、id は組ごとに分ける
  const id = useId()
  const faces = [
    { points: CUBE_TOP, from: tones[0], to: tones[1] },
    { points: CUBE_LEFT, from: tones[1], to: tones[2] },
    { points: CUBE_RIGHT, from: tones[2], to: tones[0] },
  ]

  return (
    <svg viewBox="0 0 100 104" aria-hidden focusable="false" className="w-full">
      <defs>
        {faces.map(({ from, to }, index) => (
          <linearGradient key={index} id={`${id}-${index}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        ))}
      </defs>
      {faces.map(({ points }, index) => (
        <polygon
          key={index}
          points={points}
          fill={`url(#${id}-${index})`}
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeOpacity="0.8"
          strokeLinejoin="round"
        />
      ))}
      {/* 角で光が跳ねる。上と右の頂点にだけ置いて、光の向きを揃える */}
      {CUBE_SPARKLES.map((path, index) => (
        <path key={index} d={path} fill="#ffffff" fillOpacity={index === 0 ? 0.95 : 0.7} />
      ))}
    </svg>
  )
}

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

/**
 * 立方体の傾きの幅 (度)。
 *
 * 等角投影の絵なので、大きく回すと立体に見えなくなる。少しだけ傾けて、
 * 浮かんでいる向きの違いだけを出す。
 */
const CUBE_SPIN = 22

/** 散らした立方体を並べる。白い光を添えて、きらきらして見せる。 */
function CubeField({ cubes }: { cubes: Scatter<'cube'> }) {
  return (
    <>
      {cubes.map(({ left, top, size, rotate, opacity, animation }, index) => (
        <span
          key={index}
          className="absolute"
          style={{
            left,
            top,
            width: `${size}px`,
            translate: '-50% 0',
            rotate: `${(rotate / 360) * CUBE_SPIN - CUBE_SPIN / 2}deg`,
            opacity,
            filter: 'drop-shadow(0 0 6px rgb(255 255 255 / 0.9))',
          }}
        >
          <span className="block" style={{ animation }}>
            <Cube tones={CUBE_TONES[index % CUBE_TONES.length]!} />
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
    return <NeonField shapes={NEON} />
  }

  if (motif === 'cloud') {
    return <CloudField clouds={CLOUDS} />
  }

  if (motif === 'lantern') {
    return <LanternField />
  }

  if (motif === 'dots') {
    return <DotField figures={DOT_FIGURES} color="#484965" />
  }

  if (motif === 'cube') {
    return <CubeField cubes={CUBES} />
  }

  return null
}
