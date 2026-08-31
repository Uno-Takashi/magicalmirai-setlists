/** ボーカロイド。dataset/vocaloids.yaml に対応する。 */

export type VocaloidId = string

export interface Vocaloid {
  readonly id: VocaloidId
  /** 表示名。ロケールごとに引く。 */
  readonly name: LocalizedText
  /** テーマカラー (16進)。UI のアクセントに使う。 */
  readonly color: string
}

/** ロケール ID をキーにした表示文字列。ja は必須。 */
export interface LocalizedText {
  readonly ja: string
  readonly [locale: string]: string | undefined
}

/** 指定ロケールの文字列を返す。無ければ ja にフォールバックする。 */
export function localize(text: LocalizedText, locale: string): string {
  return text[locale] ?? text.ja
}
