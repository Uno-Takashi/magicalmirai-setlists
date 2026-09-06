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

/** 2020: 吊るした提灯を並べる。揺れの軸は上端 (紐で吊るされているところ)。 */
export function LanternMotif() {
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
