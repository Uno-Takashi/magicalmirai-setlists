/**
 * 公演地の区分。テーマカラーを決めるためだけの分類で、地理的な正確さは求めない。
 *
 * 東京・大阪以外はすべて `other` に落ちる。3公演体制でなくなっても、
 * 公演地が増えてもこの分類のまま扱える。
 */

export const REGIONS = ['tokyo', 'osaka', 'other'] as const
export type Region = (typeof REGIONS)[number]

export function isRegion(value: string): value is Region {
  return (REGIONS as readonly string[]).includes(value)
}

/** 公演地ごとのテーマカラー。CSS 変数名で持ち、実際の色は index.css で定義する。 */
export function regionColorVar(region: Region): string {
  return `var(--color-region-${region})`
}
