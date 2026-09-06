import { createScatter } from './motifGeometry'
import { ScatterSpan } from './ScatterSpan'
import { Shape, type ShapeKind } from './Shape'

/** 2023: 星・三角・ひし形を白い線で描く。 */
const NEON = createScatter<ShapeKind>({
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

/** 2023: 図形をネオンにして並べる。線は白のまま、滲みだけ図形ごとに色を変える。 */
export function NeonMotif() {
  return (
    <>
      {NEON.map((item, index) => {
        const color = NEON_COLORS[index % NEON_COLORS.length]!
        const { filled, scale, spin, line } = NEON_SHAPE[item.kind]

        return (
          <ScatterSpan
            key={index}
            item={item}
            className="text-white"
            width={item.size * scale}
            style={{
              // 0〜360 の傾きを、形ごとに許した幅へ畳み込む
              rotate: `${(item.rotate / 360) * spin - spin / 2}deg`,
              filter: neonGlow(color),
              /*
                遠近を付けてから前後に倒す。rotate (傾き) や translate とは別の
                プロパティなので、混ぜても打ち消し合わない。
              */
              transform: `perspective(700px) rotateX(${item.tiltX}deg) rotateY(${item.tiltY}deg)`,
            }}
          >
            {/* 塗る形は色を敷いて、白い線で縁取る。管に色が入って見える */}
            <Shape kind={item.kind} outlined={!filled} lineWidth={line} fillColor={color} />
          </ScatterSpan>
        )
      })}
    </>
  )
}
