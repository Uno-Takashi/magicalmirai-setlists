import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { SongTitle } from '@/domain/song/Song'
import { readFavorites, writeFavorites } from '@/infrastructure/preferences/favorites'
import { FavoritesContext, type FavoritesContextValue } from './FavoritesContext'

export function FavoritesProvider({
  children,
  initialTitles,
}: {
  children: ReactNode
  /** ストーリーから状態を作るためのもの。アプリ本体では使わない。 */
  initialTitles?: readonly SongTitle[]
}) {
  const [titles, setTitles] = useState<readonly SongTitle[]>(() => initialTitles ?? readFavorites())

  // 出し入れの判定は 1 曲ごとに走るので、配列を舐めずに済むよう集合も持つ
  const set = useMemo(() => new Set(titles), [titles])

  const toggle = useCallback((title: SongTitle) => {
    setTitles((current) => {
      const next = current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title]
      writeFavorites(next)
      return next
    })
  }, [])

  const value = useMemo<FavoritesContextValue>(
    () => ({ titles, has: (title) => set.has(title), toggle }),
    [titles, set, toggle],
  )

  return <FavoritesContext value={value}>{children}</FavoritesContext>
}
