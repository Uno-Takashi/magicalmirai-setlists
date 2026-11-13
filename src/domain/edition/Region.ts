/**
 * 公演地の区分。テーマカラーを決めるためだけの分類で、地理的な正確さは求めない。
 * 色そのものは表示側 (`presentation/components/edition/regionVisuals.ts`) が持つ。
 *
 * 東京・大阪以外はすべて `other` に落ちる。3公演体制でなくなっても、
 * 公演地が増えてもこの分類のまま扱える。
 */

export const REGIONS = ['tokyo', 'osaka', 'other'] as const
export type Region = (typeof REGIONS)[number]

export function isRegion(value: string): value is Region {
  return (REGIONS as readonly string[]).includes(value)
}
