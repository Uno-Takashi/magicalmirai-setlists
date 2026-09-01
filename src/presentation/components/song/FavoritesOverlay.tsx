import { AnimatePresence, motion } from 'motion/react'
import { LuX } from 'react-icons/lu'
import { editionsOfSong } from '@/application/searchSongs'
import type { Song } from '@/domain/song/Song'
import { SongSearchResult } from '@/presentation/components/song/SongSearchResult'
import { useOverlay } from '@/presentation/hooks/useOverlay'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useFavorites } from '@/presentation/providers/FavoritesProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * お気に入りに入れた曲だけを並べる。ヘッダーの箱のアイコンから開く。
 *
 * 行の見せ方は検索結果と同じものを使う。曲名から詳細へ、年の札からその年へ
 * 移れる導線も同じなので、覚え方が 1 つで済む。
 */
export function FavoritesOverlay({
  open,
  onClose,
  onSelectSong,
  onSelectEdition,
}: {
  open: boolean
  onClose: () => void
  onSelectSong: (song: Song) => void
  onSelectEdition: (slug: string) => void
}) {
  const { t } = useLocale()
  const { catalog, searchIndex } = useCatalog()
  const { titles, count } = useFavorites()
  useOverlay(open, onClose)

  // 曲名しか覚えていないので、中身はカタログから引く。
  // データセットから曲が消えた場合は、その曲だけ静かに落とす。
  const hits = titles.flatMap((title) => {
    const song = catalog.songs.get(title)
    return song === undefined ? [] : [{ song, editions: editionsOfSong(searchIndex, title) }]
  })

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-40 flex flex-col bg-[color:var(--surface)]/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-label={t('favorites.title')}
        >
          <div className="mx-auto flex w-full max-w-3xl items-start gap-2 px-4 py-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-miku text-lg font-black">{t('favorites.title')}</h2>
              <p className="text-muted mt-0.5 text-xs">
                {count > 0 ? t('favorites.count', { count }) : t('favorites.description')}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('favorites.close')}
              className="text-muted shrink-0 rounded-lg p-2 transition hover:bg-black/5"
            >
              <LuX />
            </button>
          </div>

          <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-8">
            {hits.length === 0 ? (
              <p className="text-muted py-10 text-center text-sm">{t('favorites.empty')}</p>
            ) : (
              <ul className="grid gap-1">
                {hits.map((hit) => (
                  <li key={hit.song.title}>
                    <SongSearchResult
                      hit={hit}
                      onSelectSong={onSelectSong}
                      onSelectEdition={onSelectEdition}
                      favoriteAppearance="remove"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
