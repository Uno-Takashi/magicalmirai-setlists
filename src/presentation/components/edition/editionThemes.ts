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
export type EditionMotif =
  | 'sunflower'
  | 'starfield'
  | 'shapes'
  | 'neon'
  | 'cloud'
  | 'lantern'
  | 'dots'
  | 'cube'
  | 'prism'

export interface EditionTheme {
  /** 背景の色。上から下へ順に並べる。1 色だけなら単色になる。 */
  readonly colors: readonly [string, ...string[]]
  /**
   * 色の敷き方。既定は `gradient`。
   *
   * - `gradient`: 上から下へ流す。地の色として画面を占める
   * - `sides`: 左右の端にうっすら浮かべる。真ん中は素の地色のまま残る
   * - `spotlight`: 最後の色で塗りつぶし、上から光を当てる
   */
  readonly layout?: 'gradient' | 'sides' | 'spotlight'
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
  // 2016: 水色から浅葱色へ。モチーフは置かない。
  ['2016', { colors: ['#6ADDFC', '#9CE0DF'] }],
  // 2017: 白。三角形を重ねた立方体を散らす。
  ['2017', { colors: ['#FFFFFF'], motif: 'prism' }],
  // 2018: 淡い水色。きらきらした立方体を散らす。
  ['2018', { colors: ['#AAFCFF'], motif: 'cube' }],
  // 2019: 暗い紺を上からの光でぼんやり照らし、点で描いた図形を散らす。
  ['2019', { colors: ['#171723'], layout: 'spotlight', motif: 'dots' }],
  // 2020: 濃い桃色と淡い桃色を左右にうっすら浮かべ、提灯を吊るす。
  //       公式のテーマが「MATSURI」で、キービジュアルは夜祭りの屋台と提灯。
  ['2020', { colors: ['#ED3266', '#F5EBEA'], layout: 'sides', motif: 'lantern' }],
  // 2021: 空。青から白へ抜ける地に、うっすら雲を浮かべる。
  ['2021', { colors: ['#7FA5CA', '#FFFFFF'], motif: 'cloud', titleColor: '#1B3A63' }],
  // 10th: 淡い水色から桃色へ。開催は 2022〜2023 年だが、識別子は西暦ではない。
  ['10th', { colors: ['#9DF1FC', '#F898E0'], layout: 'sides', titleColor: '#06B6E3' }],
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

/**
 * 表にあるすべての開催回。slug と配色の組を、表に書いた順で返す。
 *
 * Storybook の一覧が使う。年を足せばそちらにも自動で並ぶので、見本を別に
 * 書き写さずに済む。
 */
export function allEditionThemes(): [string, EditionTheme][] {
  return [...THEMES]
}
