import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import type { SongTitle } from '@/domain/song/Song'
import { readFavorites, writeFavorites } from '@/infrastructure/preferences/favorites'

/**
 * お気に入りにした曲。
 *
 * 持つのは曲名だけで、曲の中身はカタログから引く。曲名は songs.yaml の自然キー
 * なので、これだけ覚えておけば次に来たときも同じ曲に行き当たる。
 *
 * 並びは追加した順。あとから見たときに「最近入れたもの」が下に積まれる。
 */
interface FavoritesValue {
  /** 追加した順の曲名。 */
  readonly titles: readonly SongTitle[]
  readonly count: number
  has: (title: SongTitle) => boolean
  toggle: (title: SongTitle) => void
}

const FavoritesContext = createContext<FavoritesValue | null>(null)

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

  const value = useMemo<FavoritesValue>(
    () => ({ titles, count: titles.length, has: (title) => set.has(title), toggle }),
    [titles, set, toggle],
  )

  return <FavoritesContext value={value}>{children}</FavoritesContext>
}

export function useFavorites(): FavoritesValue {
  const value = use(FavoritesContext)
  if (value === null) throw new Error('FavoritesProvider の外で useFavorites を呼び出しています')
  return value
}
