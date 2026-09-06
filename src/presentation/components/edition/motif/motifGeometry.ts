/**
 * 背景のモチーフの「決める」側。散らす位置と図形の形を計算するだけで、描かない。
 *
 * 絵を描く部分 (`*Motif.tsx`) から計算を切り離してあるのは、
 * どちらも長くなりやすいのと、散らばりや形の決まりごと —— 種を固定して毎回同じ絵に
 * すること、帯に 1 つずつ置いて固まらせないこと —— を単体で確かめられるようにするため。
 *
 * **ここには React を持ち込まない。** 返すのは数と文字列だけ。
 */

/** 平面上の点。SVG の viewBox 上の座標として使う。 */
export type Point = readonly [number, number]

/**
 * 種を固定した擬似乱数。散らし方を決めるのに使う。
 *
 * 描き直すたびに散らばりが変わると、年を送って戻っただけで別の絵になってしまう。
 * 種から決めておけば、いつ描いても同じ並びになる。
 */
export function createRandom(seed: number): () => number {
  let value = seed
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648
    return value / 2147483648
  }
}

/** 星 1 つの置き方。位置と瞬きの拍を持つ。 */
export interface StarPlacement {
  readonly left: string
  readonly top: string
  readonly size: string
  readonly animation: string
}

/**
 * 星の散らし方。
 *
 * 縦は rem で置く。割合にすると、曲数の多い年ほど星が下の明るいところまで
 * 伸びて見えなくなる。色が濃紺から水色に変わりきるまでの範囲に留める。
 */
export function createStars(count: number, seed: number): StarPlacement[] {
  const random = createRandom(seed)

  return Array.from({ length: count }, () => ({
    left: `${random() * 100}%`,
    // 上ほど密にする。地の色が濃いところに寄せると夜空らしくなる
    top: `${random() ** 1.7 * 52}rem`,
    size: `${1.5 + random() * 2}px`,
    animation: `twinkle ${3 + random() * 4}s ease-in-out ${-random() * 6}s infinite`,
  }))
}

/**
 * 散らし方の指定。年ごとに違うのはこの数値だけ。
 *
 * 形の種類は総称にしてある。雲のように `Shape` を通さない絵でも、置き方だけは
 * 同じ仕組みに乗せられる。
 */
export interface ScatterSpec<Kind extends string> {
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

/** 散らした 1 つの置き方。 */
export interface ScatterItem<Kind extends string> {
  readonly kind: Kind
  readonly outlined: boolean
  readonly left: string
  readonly top: string
  readonly size: number
  readonly rotate: number
  readonly opacity: number
  readonly animation: string
  /** 奥へ倒す角度。 */
  readonly tiltX: number
  /** 横へ振る角度。 */
  readonly tiltY: number
}

export type Scatter<Kind extends string> = readonly ScatterItem<Kind>[]

/**
 * 図形の散らし方。大きさ・傾き・濃さを 1 つずつずらす。
 *
 * 横は幅を図形の数で割った帯に 1 つずつ置き、帯の中で位置をずらす。まるごと
 * 乱数に任せると固まったり空いたりして、端の 1 つが浮いて見える。
 *
 * 星と同じく縦は rem で置き、地の色が濃いうちに収める。割合にすると、曲数の
 * 多い年ほど下の明るいところまで伸びて見えなくなる。
 */
export function createScatter<Kind extends string>(spec: ScatterSpec<Kind>): Scatter<Kind> {
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
    tiltX: spec.tilt === undefined ? 0 : (random() - 0.5) * 2 * spec.tilt,
    tiltY: spec.tilt === undefined ? 0 : (random() - 0.5) * 2 * spec.tilt,
  }))
}

/** 星の頂点。外と内を交互に、真上から時計回りに 10 個。 */
export function starVertices(outer: number, inner: number): Point[] {
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
export function roundedPath(points: readonly Point[], roundness: number): string {
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

/** 雲を作る丸 1 つ。 */
export interface CloudPuff {
  readonly cx: number
  readonly cy: number
  readonly r: number
}

/**
 * 雲。大きさの違う丸をいくつも重ねて塊を作る。
 *
 * 形は 1 つずつ変える。同じ絵を並べると模様に見えて、空に浮かんでいる感じが出ない。
 * 種は雲の順番から決めるので、いつ描いても同じ空になる。
 */
export function cloudPuffs(index: number): CloudPuff[] {
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

/** 点で描く図形の種類。 */
export const DOT_KINDS = ['grid', 'frame', 'triangle'] as const
export type DotKind = (typeof DOT_KINDS)[number]

/** 5 行 5 列の格子。図形ごとに、どの目に丸を置くかだけを変える。 */
const DOT_STEPS = [0, 1, 2, 3, 4]

/** 点で描いた図形。小さい丸を格子に並べて、四角形や三角形の形を表す。 */
export function dotsOf(kind: DotKind): { x: number; y: number }[] {
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

/**
 * 立方体の 3 面。等角投影で上・左・右を見せる。
 *
 * 2018 (単色の破片) と 2017 (半透明の三角形の重なり) が同じ形を使う。
 */
export const CUBE_FACES: Point[][] = [
  [
    [50, 6],
    [92, 30],
    [50, 54],
    [8, 30],
  ],
  [
    [8, 30],
    [50, 54],
    [50, 98],
    [8, 74],
  ],
  [
    [92, 30],
    [50, 54],
    [50, 98],
    [92, 74],
  ],
]

/**
 * 多角形を 2 つに切る。
 *
 * 2 本の辺の上に点を取り、その 2 点を結んで分ける。切る辺の組は、どちらの破片も
 * 3〜5 角形に収まるものだけから選ぶ。角が増えすぎると、面というより破片の
 * かたまりに見える。
 */
export function splitPolygon(polygon: Point[], random: () => number): Point[][] | null {
  const size = polygon.length
  const options: [number, number][] = []
  for (let from = 0; from < size; from += 1) {
    for (let to = from + 1; to < size; to += 1) {
      const near = to - from + 2
      const far = size - (to - from) + 2
      if (near >= 3 && near <= 5 && far >= 3 && far <= 5) options.push([from, to])
    }
  }
  const pick = options[Math.floor(random() * options.length)]
  if (pick === undefined) return null

  const [from, to] = pick
  const cut = (edge: number): Point => {
    const start = polygon[edge]!
    const end = polygon[(edge + 1) % size]!
    // 端に寄せすぎると細い破片ができるので、辺の内側 3 割〜7 割で切る
    const at = 0.3 + random() * 0.4
    return [start[0] + (end[0] - start[0]) * at, start[1] + (end[1] - start[1]) * at]
  }

  const head = cut(from)
  const tail = cut(to)
  const near = [head, ...polygon.slice(from + 1, to + 1), tail]
  const far = [tail, ...polygon.slice(to + 1), ...polygon.slice(0, from + 1), head]
  return [near, far]
}

/** 1 つの立方体の割り方。面ごとに 2 回ずつ切って、3 枚の破片にする。 */
export function cubePieces(index: number): string[] {
  const random = createRandom(20180825 + index * 613)

  return CUBE_FACES.flatMap((face) => {
    let pieces: Point[][] = [face]
    for (let round = 0; round < 2; round += 1) {
      const target = Math.floor(random() * pieces.length)
      const split = splitPolygon(pieces[target]!, random)
      if (split === null) continue
      pieces = pieces.flatMap((piece, at) => (at === target ? split : [piece]))
    }
    return pieces.map((piece) => piece.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '))
  })
}

/**
 * 2017 の面に置く色。面ごとに色の系統を 1 つか 2 つだけ選ぶ。
 *
 * 重なったところは下の色が透けて濃くなるので、塗り分けなくても濃淡が生まれる。
 */
const PRISM_FAMILIES: (readonly string[])[] = [
  ['#FFE9A8', '#FFD37A', '#FFB65E'],
  ['#BFEBFF', '#8FD8F5', '#6BC3E8'],
  ['#FFD3E4', '#FFAFCC', '#FF8FB8'],
  ['#DCD3FF', '#BEAEF5', '#A794EC'],
  ['#CFF3DC', '#A5E3BF', '#7FD3A4'],
]

/** 2017 の立方体 1 つ。大きな三角形を半透明で重ねる。 */
export function prismCube(index: number): { points: string; color: string }[] {
  const random = createRandom(20170819 + index * 733)

  return CUBE_FACES.flatMap((face) => {
    // 2 系統にするときは色相を 2 つ飛ばす。隣の系統だと混ぜても違いが出ない
    const first = Math.floor(random() * PRISM_FAMILIES.length)
    const families =
      random() < 0.5
        ? [PRISM_FAMILIES[first]!]
        : [PRISM_FAMILIES[first]!, PRISM_FAMILIES[(first + 2) % PRISM_FAMILIES.length]!]

    const center: Point = [
      face.reduce((sum, [x]) => sum + x, 0) / face.length,
      face.reduce((sum, [, y]) => sum + y, 0) / face.length,
    ]

    return Array.from({ length: 3 + Math.floor(random() * 2) }, () => {
      // 4 隅から 1 つ落として三角形にする。落とす角を変えると向きが変わる
      const drop = Math.floor(random() * face.length)
      const points = face
        .filter((_, at) => at !== drop)
        .map(([x, y]) => {
          // 半分は角のまま。残りだけ中心へ寄せて、重なり方をずらす
          const pull = random() < 0.5 ? 0 : random() * 0.26
          return `${(x + (center[0] - x) * pull).toFixed(1)},${(y + (center[1] - y) * pull).toFixed(1)}`
        })
        .join(' ')

      const family = families[Math.floor(random() * families.length)]!
      return { points, color: family[Math.floor(random() * family.length)]! }
    })
  })
}

/**
 * 光の粒。4 方向へ尖った星で、頂点で光が跳ねているように見せる。
 *
 * 制御点を中心に置くと辺がへこみ、尖りだけが残る。
 */
export function sparkle(cx: number, cy: number, r: number): string {
  return [
    `M${cx},${cy - r}`,
    `Q${cx},${cy} ${cx + r},${cy}`,
    `Q${cx},${cy} ${cx},${cy + r}`,
    `Q${cx},${cy} ${cx - r},${cy}`,
    `Q${cx},${cy} ${cx},${cy - r}`,
    'Z',
  ].join('')
}
