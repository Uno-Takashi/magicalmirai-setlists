/**
 * お気に入りにした曲の永続化。
 *
 * 曲名 (songs.yaml の自然キー) の配列を JSON で置く。読めなければ空として続行する
 * (お気に入りは補助的な機能で、読めないからといって画面を止める理由にはならない)。
 */

import type { SongTitle } from '@/domain/song/Song'
import { readStoredItem, writeStoredItem } from '@/infrastructure/storage/safeLocalStorage'

const STORAGE_KEY = 'mm-favorites'

export function readFavorites(): SongTitle[] {
  const stored = readStoredItem(STORAGE_KEY)
  if (stored === null) return []
  try {
    const parsed: unknown = JSON.parse(stored)
    // 手で編集された場合や、古い形式が残っている場合に備えて中身も確かめる
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function writeFavorites(titles: readonly SongTitle[]): void {
  writeStoredItem(STORAGE_KEY, JSON.stringify(titles))
}
