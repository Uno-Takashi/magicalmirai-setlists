/**
 * 背景の絵は飾りだが、散らし方には守りたい決まりがある。
 * 「毎回同じ絵になること」「帯に 1 つずつ置いて固まらせないこと」あたりは
 * 崩れても気付きにくいので、ここで留める。
 */

import { describe, expect, it } from 'vitest'
import {
  CUBE_FACES,
  cloudPuffs,
  createRandom,
  createScatter,
  createStars,
  cubePieces,
  DOT_KINDS,
  dotsOf,
  prismCube,
  roundedPath,
  sparkle,
  splitPolygon,
  starVertices,
  type Point,
} from './motifGeometry'

describe('createRandom', () => {
  it('同じ種からは同じ並びが出る。年を送って戻っても絵が変わらないため', () => {
    const a = createRandom(12345)
    const b = createRandom(12345)
    expect(Array.from({ length: 10 }, a)).toEqual(Array.from({ length: 10 }, b))
  })

  it('種が違えば別の並びになる', () => {
    const a = createRandom(1)
    const b = createRandom(2)
    expect(Array.from({ length: 10 }, a)).not.toEqual(Array.from({ length: 10 }, b))
  })

  it('0 以上 1 未満に収まる', () => {
    const random = createRandom(20240809)
    for (let i = 0; i < 500; i += 1) {
      const value = random()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('createStars', () => {
  it('頼んだ数だけ作る', () => {
    expect(createStars(42, 20250808)).toHaveLength(42)
  })

  it('同じ種なら同じ夜空になる', () => {
    expect(createStars(20, 7)).toEqual(createStars(20, 7))
  })

  it('横は割合、縦は rem で置く。曲数が増えても明るいところまで伸びない', () => {
    for (const star of createStars(50, 20250808)) {
      expect(star.left).toMatch(/^[\d.]+%$/)
      expect(star.top).toMatch(/^[\d.]+rem$/)
      expect(Number.parseFloat(star.top)).toBeLessThanOrEqual(52)
    }
  })

  it('瞬きの拍は星ごとにずらす', () => {
    const animations = new Set(createStars(50, 20250808).map((star) => star.animation))
    expect(animations.size).toBeGreaterThan(1)
  })
})

describe('createScatter', () => {
  const spec = {
    count: 12,
    seed: 20240809,
    kinds: ['circle', 'star'] as const,
    size: [50, 150] as const,
    outlinedRate: 0.5,
    opacity: [0.2, 0.5] as const,
    depth: 40,
  }

  it('同じ指定なら同じ散らばりになる', () => {
    expect(createScatter(spec)).toEqual(createScatter(spec))
  })

  it('頼んだ数だけ作る', () => {
    expect(createScatter(spec)).toHaveLength(12)
  })

  it('大きさと濃さは指定した範囲に収まる', () => {
    for (const item of createScatter(spec)) {
      expect(item.size).toBeGreaterThanOrEqual(50)
      expect(item.size).toBeLessThanOrEqual(150)
      expect(item.opacity).toBeGreaterThanOrEqual(0.2)
      expect(item.opacity).toBeLessThanOrEqual(0.5)
    }
  })

  it('指定した形しか使わない', () => {
    for (const item of createScatter(spec)) {
      expect(spec.kinds).toContain(item.kind)
    }
  })

  it('横は数で割った帯に 1 つずつ置く。まるごと乱数だと固まって端が浮く', () => {
    const lefts = createScatter(spec).map((item) => Number.parseFloat(item.left))
    // 帯の幅は 100 / 12。i 番目は必ず i 番目の帯に入る
    const band = 100 / spec.count
    lefts.forEach((left, index) => {
      expect(left).toBeGreaterThanOrEqual(index * band)
      expect(left).toBeLessThan((index + 1) * band)
    })
  })

  it('縦は上端の空きから、指定した深さまでに収まる', () => {
    const withFrom = createScatter({ ...spec, from: 7 })
    for (const item of withFrom) {
      const top = Number.parseFloat(item.top)
      expect(top).toBeGreaterThanOrEqual(7)
      expect(top).toBeLessThanOrEqual(7 + spec.depth)
    }
  })

  it('傾きを指定しない年は、画面と正対したままにする', () => {
    for (const item of createScatter(spec)) {
      expect(item.tiltX).toBe(0)
      expect(item.tiltY).toBe(0)
    }
  })

  it('傾きを指定した年だけ、指定した幅のなかで倒す', () => {
    for (const item of createScatter({ ...spec, tilt: 26 })) {
      expect(Math.abs(item.tiltX)).toBeLessThanOrEqual(26)
      expect(Math.abs(item.tiltY)).toBeLessThanOrEqual(26)
    }
  })

  it('傾きを指定すると乱数を余分に使うので、散らばりごと変わる', () => {
    // 傾きは最後に引くため、2 つ目からは前の要素のぶんだけ並びがずれる。
    // 既定のままの年は random を呼ばないので、これまでの絵は動かない。
    const plain = createScatter(spec)
    const tilted = createScatter({ ...spec, tilt: 26 })
    expect(tilted[0]!.left).toBe(plain[0]!.left)
    expect(tilted.map((item) => item.left)).not.toEqual(plain.map((item) => item.left))
  })

  it('輪郭の割合が 1 なら全部が輪郭になる', () => {
    const outlined = createScatter({ ...spec, outlinedRate: 1 })
    expect(outlined.every((item) => item.outlined)).toBe(true)
  })

  it('輪郭の割合が 0 なら 1 つも輪郭にしない', () => {
    const filled = createScatter({ ...spec, outlinedRate: 0 })
    expect(filled.some((item) => item.outlined)).toBe(false)
  })
})

describe('starVertices', () => {
  it('外と内を交互に 10 個の頂点を作る', () => {
    const points = starVertices(40, 20)
    expect(points).toHaveLength(10)
  })

  it('最初の頂点は真上', () => {
    const [first] = starVertices(40, 20)
    expect(first![0]).toBeCloseTo(50)
    expect(first![1]).toBeCloseTo(10)
  })

  it('偶数番は外側の半径、奇数番は内側の半径に乗る', () => {
    const distance = ([x, y]: Point) => Math.hypot(x - 50, y - 50)
    starVertices(40, 20).forEach((point, index) => {
      expect(distance(point)).toBeCloseTo(index % 2 === 0 ? 40 : 20)
    })
  })
})

describe('roundedPath', () => {
  const square: Point[] = [
    [0, 0],
    [100, 0],
    [100, 100],
    [0, 100],
  ]

  it('閉じた path を返す', () => {
    const path = roundedPath(square, 0.2)
    expect(path.startsWith('M')).toBe(true)
    expect(path.endsWith('Z')).toBe(true)
  })

  it('頂点の数だけ曲線を置く', () => {
    expect([...roundedPath(square, 0.2).matchAll(/Q/g)]).toHaveLength(square.length)
  })

  it('丸めが強いほど、頂点そのものからは離れる', () => {
    // 0.5 にすると辺の真ん中どうしが繋がり、角が完全に取れる。
    // 始点は最初の頂点から 1 つ前の頂点へ向かった中点になる
    expect(roundedPath(square, 0.5)).toContain('M0.0 50.0')
    expect(roundedPath(square, 0)).toContain('M0.0 0.0')
  })
})

describe('cloudPuffs', () => {
  it('雲ごとに形を変える。同じ絵が並ぶと模様に見える', () => {
    expect(cloudPuffs(0)).not.toEqual(cloudPuffs(1))
  })

  it('同じ順番の雲はいつも同じ形になる', () => {
    expect(cloudPuffs(3)).toEqual(cloudPuffs(3))
  })

  it('下を揃えて上へだけ膨らませる', () => {
    // 積乱雲のように上が盛り上がって見えるように、丸の中心は基準線より上に来る
    for (const puff of cloudPuffs(2)) {
      expect(puff.cy).toBeLessThan(42)
    }
  })

  it('丸をいくつも重ねて塊にする', () => {
    expect(cloudPuffs(0).length).toBeGreaterThanOrEqual(7)
  })
})

describe('dotsOf', () => {
  it('格子は 5 行 5 列すべてを埋める', () => {
    expect(dotsOf('grid')).toHaveLength(25)
  })

  it('枠は外周だけを残す', () => {
    // 5x5 の外周は 16 個。中を抜くと四角形の輪郭として読める
    expect(dotsOf('frame')).toHaveLength(16)
  })

  it('三角は行が下がるほど 1 つずつ増える', () => {
    expect(dotsOf('triangle')).toHaveLength(1 + 2 + 3 + 4 + 5)
  })

  it('どの形も同じ形なら同じ点を返す', () => {
    for (const kind of DOT_KINDS) {
      expect(dotsOf(kind)).toEqual(dotsOf(kind))
    }
  })
})

describe('splitPolygon', () => {
  it('多角形を 2 つに分ける', () => {
    const split = splitPolygon([...CUBE_FACES[0]!], createRandom(1))
    expect(split).not.toBeNull()
    expect(split).toHaveLength(2)
  })

  it('どちらの破片も 3〜5 角形に収まる', () => {
    // 角が増えすぎると、面というより破片のかたまりに見える
    for (let seed = 1; seed < 40; seed += 1) {
      const split = splitPolygon([...CUBE_FACES[0]!], createRandom(seed))
      if (split === null) continue
      for (const piece of split) {
        expect(piece.length).toBeGreaterThanOrEqual(3)
        expect(piece.length).toBeLessThanOrEqual(5)
      }
    }
  })

  it('三角形は 3 角形と 4 角形に分かれる', () => {
    const triangle: Point[] = [
      [0, 0],
      [10, 0],
      [5, 10],
    ]
    const split = splitPolygon(triangle, createRandom(1))
    expect(split?.map((piece) => piece.length).sort()).toEqual([3, 4])
  })

  it('どう切っても 3〜5 角形に収まらない形では切らない', () => {
    // 八角形はどこで切っても、片方が 6 角形以上になる
    const octagon: Point[] = Array.from({ length: 8 }, (_, index) => {
      const angle = (index / 8) * Math.PI * 2
      return [50 + 40 * Math.cos(angle), 50 + 40 * Math.sin(angle)] as const
    })
    expect(splitPolygon([...octagon], createRandom(1))).toBeNull()
  })
})

describe('cubePieces', () => {
  it('同じ順番の立方体はいつも同じ割り方になる', () => {
    expect(cubePieces(5)).toEqual(cubePieces(5))
  })

  it('立方体ごとに割り方を変える', () => {
    expect(cubePieces(0)).not.toEqual(cubePieces(1))
  })

  it('3 面をそれぞれ 3 枚に割る', () => {
    expect(cubePieces(0)).toHaveLength(CUBE_FACES.length * 3)
  })

  it('破片は SVG の points に書ける形にする', () => {
    for (const piece of cubePieces(0)) {
      expect(piece).toMatch(/^[\d.,\s-]+$/)
    }
  })
})

describe('prismCube', () => {
  it('同じ順番の立方体はいつも同じ面になる', () => {
    expect(prismCube(4)).toEqual(prismCube(4))
  })

  it('面ごとに三角形を 3〜4 枚重ねる', () => {
    const pieces = prismCube(0)
    expect(pieces.length).toBeGreaterThanOrEqual(CUBE_FACES.length * 3)
    expect(pieces.length).toBeLessThanOrEqual(CUBE_FACES.length * 4)
  })

  it('三角形なので頂点は 3 つ', () => {
    for (const { points } of prismCube(0)) {
      expect(points.split(' ')).toHaveLength(3)
    }
  })

  it('色は 16 進で持つ', () => {
    for (const { color } of prismCube(0)) {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i)
    }
  })
})

describe('sparkle', () => {
  it('閉じた path を返す', () => {
    const path = sparkle(50, 6, 11)
    expect(path.startsWith('M50,-5')).toBe(true)
    expect(path.endsWith('Z')).toBe(true)
  })

  it('4 方向へ尖らせる', () => {
    expect([...sparkle(0, 0, 10).matchAll(/Q/g)]).toHaveLength(4)
  })
})
