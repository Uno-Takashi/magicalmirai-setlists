/**
 * 開催回のタイトル画像。
 *
 * `dataset/<年>/title.(png|jpg|webp|svg)` を置くと自動で読み込まれる。
 * 画像を追加するのに YAML やコードを触る必要はない。
 */

const files = import.meta.glob('/dataset/*/title.{png,jpg,jpeg,webp,svg}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** ディレクトリ名 (西暦) -> 画像 URL */
const byDirectory = new Map<string, string>()
for (const [path, url] of Object.entries(files)) {
  const directory = path.split('/')[2]
  if (directory !== undefined) byDirectory.set(directory, url)
}

export function titleImageOf(year: number): string | undefined {
  return byDirectory.get(String(year))
}
