/**
 * dataset/ の YAML をビルド時に取り込み、カタログを組み立てる。
 *
 * 完全に static なサイトなので、実行時のフェッチはせず Vite のバンドルに含める。
 * dataset/ に年ディレクトリを増やすだけで自動的に読み込まれる。
 */

import { parse } from 'yaml'
import { type Catalog, validateCatalog } from '@/domain/catalog/Catalog'
import type { RawEdition, RawSetlistFile, RawSongFile, RawVocaloidFile } from './rawTypes'
import { toCatalog } from './toCatalog'

const SONG_FILE = '/dataset/songs.yaml'
const VOCALOID_FILE = '/dataset/vocaloids.yaml'

/**
 * dataset/ の YAML をパスごとに引ける形。
 *
 * CI の検証 (`dataset.node.test.ts`) もこれを走査するので、読み込むファイルの範囲は
 * このグロブ 1 か所で決まる。
 */
export const datasetSources: Readonly<Record<string, string>> = import.meta.glob(
  [
    '/dataset/*/edition.yaml',
    '/dataset/*/setlist.yaml',
    '/dataset/songs.yaml',
    '/dataset/vocaloids.yaml',
  ],
  { query: '?raw', import: 'default', eager: true },
)

function parseOne<T>(source: string, path: string): T {
  try {
    return parse(source) as T
  } catch (cause) {
    throw new Error(`${path} の YAML を解釈できませんでした: ${String(cause)}`, { cause })
  }
}

function parseRequired<T>(path: string): T {
  const source = datasetSources[path]
  if (source === undefined) throw new Error(`${path} が見つかりません`)
  return parseOne<T>(source, path)
}

/** 年ディレクトリ名を取り出す。'/dataset/2023/edition.yaml' -> '2023' */
function directoryOf(path: string): string {
  return path.split('/')[2] ?? path
}

export function loadCatalog(): Catalog {
  const editionFiles = Object.entries(datasetSources).filter(([path]) =>
    path.endsWith('/edition.yaml'),
  )
  const editions = editionFiles.map(([path, source]) => {
    const setlistPath = `/dataset/${directoryOf(path)}/setlist.yaml`
    const setlistSource = datasetSources[setlistPath]
    return {
      edition: parseOne<RawEdition>(source, path),
      setlist:
        setlistSource === undefined
          ? { sets: [] }
          : parseOne<RawSetlistFile>(setlistSource, setlistPath),
    }
  })

  const catalog = toCatalog(
    editions,
    parseRequired<RawSongFile>(SONG_FILE),
    parseRequired<RawVocaloidFile>(VOCALOID_FILE),
  )

  const errors = validateCatalog(catalog)
  if (errors.length > 0) {
    throw new Error(`dataset の整合性エラー:\n- ${errors.join('\n- ')}`)
  }

  return catalog
}
