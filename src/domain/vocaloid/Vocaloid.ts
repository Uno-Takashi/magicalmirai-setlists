/** ボーカロイド。dataset/vocaloids.yaml に対応する。 */

import type { LocalizedText } from '@/domain/shared/LocalizedText'

export type VocaloidId = string

export interface Vocaloid {
  readonly id: VocaloidId
  /** 表示名。ロケールごとに引く。 */
  readonly name: LocalizedText
  /** テーマカラー (16進)。UI のアクセントに使う。 */
  readonly color: string
}
