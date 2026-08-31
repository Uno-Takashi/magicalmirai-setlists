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

type RawModules = Record<string, string>

const editionFiles = import.meta.glob('/dataset/*/edition.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as RawModules

const setlistFiles = import.meta.glob('/dataset/*/setlist.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as RawModules

const songFile = import.meta.glob('/dataset/songs.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as RawModules

const vocaloidFile = import.meta.glob('/dataset/vocaloids.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as RawModules

function parseOne<T>(source: string, path: string): T {
  try {
    return parse(source) as T
  } catch (cause) {
    throw new Error(`${path} の YAML を解釈できませんでした: ${String(cause)}`, { cause })
  }
}

function requireSingle(modules: RawModules, path: string): string {
  const source = modules[path]
  if (source === undefined) {
    throw new Error(`${path} が見つかりません`)
  }
  return source
}

/** 年ディレクトリ名を取り出す。'/dataset/2023/edition.yaml' -> '2023' */
function directoryOf(path: string): string {
  return path.split('/')[2] ?? path
}

export function loadCatalog(): Catalog {
  const editions = Object.entries(editionFiles).map(([path, source]) => {
    const directory = directoryOf(path)
    const setlistPath = `/dataset/${directory}/setlist.yaml`
    const setlistSource = setlistFiles[setlistPath]
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
    parseOne<RawSongFile>(requireSingle(songFile, '/dataset/songs.yaml'), '/dataset/songs.yaml'),
    parseOne<RawVocaloidFile>(
      requireSingle(vocaloidFile, '/dataset/vocaloids.yaml'),
      '/dataset/vocaloids.yaml',
    ),
  )

  const errors = validateCatalog(catalog)
  if (errors.length > 0) {
    throw new Error(`dataset の整合性エラー:\n- ${errors.join('\n- ')}`)
  }

  return catalog
}
