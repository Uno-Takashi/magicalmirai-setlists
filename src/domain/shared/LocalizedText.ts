/**
 * ロケール ID をキーにした表示文字列。ja は必須。
 *
 * 曲名以外の固有名 (開催回・公演地・会場・ボーカロイドの名前) はデータ側で訳を持つ。
 * UI の文言の翻訳 (`infrastructure/i18n`) とは別のもの。
 */
export interface LocalizedText {
  readonly ja: string
  readonly [locale: string]: string | undefined
}

/** 指定ロケールの文字列を返す。無ければ ja にフォールバックする。 */
export function localize(text: LocalizedText, locale: string): string {
  return text[locale] ?? text.ja
}
