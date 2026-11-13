/**
 * 翻訳文の `{name}` 形式のプレースホルダに値を差し込む。
 *
 * 画面 (`i18n.ts`) とビルド時に書き出す HTML (`build/pageMeta.ts`) の両方が使う。
 * ビルド側は Node で読むので、**このファイルは何も import しない。**
 * 渡されなかったプレースホルダはそのまま残す (抜けが画面で見つかるように)。
 */
export function interpolate(
  template: string,
  params: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}
