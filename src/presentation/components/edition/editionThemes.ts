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
export type EditionMotif = 'sunflower'

export interface EditionTheme {
  /** 背景のグラデーション。上から下へ順に並べる。1 色だけなら単色になる。 */
  readonly colors: readonly [string, ...string[]]
  /** その年のモチーフ。無い年は色だけで見せる。 */
  readonly motif?: EditionMotif
}

const THEMES = new Map<string, EditionTheme>([
  // 2026: 若草色から水色へ。テーマにヒマワリを含む。
  ['2026', { colors: ['#ECFEE8', '#E4FEFD'], motif: 'sunflower' }],
])

export function editionThemeOf(slug: string): EditionTheme | undefined {
  return THEMES.get(slug)
}
