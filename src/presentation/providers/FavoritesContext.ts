import { createContext } from 'react'
import type { SongTitle } from '@/domain/song/Song'
import { useRequiredContext } from './requiredContext'

/**
 * お気に入りにした曲。
 *
 * 持つのは曲名だけで、曲の中身はカタログから引く。曲名は songs.yaml の自然キー
 * なので、これだけ覚えておけば次に来たときも同じ曲に行き当たる。
 */
export interface FavoritesContextValue {
  /** 追加した順の曲名。あとから見たときに「最近入れたもの」が下に積まれる。 */
  readonly titles: readonly SongTitle[]
  has: (title: SongTitle) => boolean
  toggle: (title: SongTitle) => void
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function useFavorites(): FavoritesContextValue {
  return useRequiredContext(FavoritesContext, 'useFavorites')
}
