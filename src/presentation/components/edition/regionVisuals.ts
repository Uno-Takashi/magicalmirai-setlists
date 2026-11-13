import type { Region } from '@/domain/edition/Region'

/**
 * 公演地のテーマカラー。CSS 変数で持ち、実際の色は index.css の `@theme` で定義する。
 *
 * 公演地カード・会場の詳細・セットリストの切り替えで同じ色を使う。
 */
export const REGION_COLOR = {
  tokyo: 'var(--color-region-tokyo)',
  osaka: 'var(--color-region-osaka)',
  other: 'var(--color-region-other)',
} as const satisfies Record<Region, string>
