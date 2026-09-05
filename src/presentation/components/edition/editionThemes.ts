/**
 * 開催回ごとの背景。年ごとの色と、添える意匠を決める。
 *
 * **dataset には置かない。** ここにあるのは公式が定めた値ではなく、その年の
 * ビジュアルから受けた印象をこのサイトの背景に写したもので、公演の事実を記録する
 * dataset とは性格が違う。見え方の都合でいつでも変えてよい表示側の判断として、
 * presentation に置く。
 *
 * 年を足すときはこの表に slug で 1 行足す。載っていない年は背景を敷かず、
 * これまでどおり素の地色で出る。
 */

/** 背景に添える意匠。絵そのものは `EditionMotifArt` が持つ。 */
export type EditionMotif = 'sunflower' | 'starfield' | 'shapes' | 'neon'

export interface EditionTheme {
  /** 背景のグラデーション。上から下へ順に並べる。1 色だけなら単色になる。 */
  readonly colors: readonly [string, ...string[]]
  /** その年のモチーフ。無い年は色だけで見せる。 */
  readonly motif?: EditionMotif
  /**
   * 見出しの色。省略すると他の年と同じミク色になる。
   *
   * その年の背景に合わせたいときだけ書く。ミク色 (#39C5BB) は明るさが中ほどに
   * あるので、明るい背景に重ねるとコントラストが落ちて題名が沈む。
   */
  readonly titleColor?: string
}

const THEMES = new Map<string, EditionTheme>([
  // 10th: 淡い水色から桃色へ。開催は 2022〜2023 年だが、識別子は西暦ではない。
  ['10th', { colors: ['#9DF1FC', '#F898E0'], titleColor: '#C0187E' }],
  // 2023: 黒一色に、白い線の図形を色とりどりのネオンで光らせる。
  ['2023', { colors: ['#000000'], motif: 'neon', titleColor: '#FFFFFF' }],
  // 2024: 水色から淡い水色へ。星・丸・角丸の三角を薄く散らす。
  ['2024', { colors: ['#85D5DE', '#D8F4F5'], motif: 'shapes', titleColor: '#FFCD5A' }],
  // 2025: 濃紺から水色、藤色へ。白い点の星を散らす。
  ['2025', { colors: ['#0C2E64', '#78D9E1', '#CBC1FB'], motif: 'starfield' }],
  // 2026: 若草色から水色へ。テーマにヒマワリを含む。
  ['2026', { colors: ['#ECFEE8', '#E4FEFD'], motif: 'sunflower', titleColor: '#1E86B7' }],
])

export function editionThemeOf(slug: string): EditionTheme | undefined {
  return THEMES.get(slug)
}
