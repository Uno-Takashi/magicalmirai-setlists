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
export type EditionMotif = 'sunflower' | 'starfield' | 'shapes'

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

/**
 * ミク色の色味を保ったまま暗くした見出しの色。
 *
 * 2026 の #ECFEE8 に対して 7.3:1 で、大きい文字の下限 3:1 を満たす
 * (ミク色のままだと 2.0:1 しかない)。
 */
const DEEP_MIKU = '#0E5C63'

const THEMES = new Map<string, EditionTheme>([
  // 2024: 水色から淡い水色へ。星・丸・角丸の三角を薄く散らす。
  ['2024', { colors: ['#85D5DE', '#D8F4F5'], motif: 'shapes', titleColor: '#FFCD5A' }],
  // 2025: 濃紺から水色、藤色へ。白い点の星を散らす。
  ['2025', { colors: ['#0C2E64', '#78D9E1', '#CBC1FB'], motif: 'starfield' }],
  // 2026: 若草色から水色へ。テーマにヒマワリを含む。
  ['2026', { colors: ['#ECFEE8', '#E4FEFD'], motif: 'sunflower', titleColor: DEEP_MIKU }],
])

export function editionThemeOf(slug: string): EditionTheme | undefined {
  return THEMES.get(slug)
}
