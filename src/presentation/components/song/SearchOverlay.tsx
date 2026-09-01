import { AnimatePresence, motion } from 'motion/react'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { LuSearch, LuX } from 'react-icons/lu'
import { searchSongs, singersOfSong } from '@/application/searchSongs'
import type { Song } from '@/domain/song/Song'
import { SongSearchResult } from '@/presentation/components/song/SongSearchResult'
import { VocaloidFilter } from '@/presentation/components/vocaloid/VocaloidFilter'
import { useVocaloidFilter } from '@/presentation/components/vocaloid/useVocaloidFilter'
import { useOverlay } from '@/presentation/hooks/useOverlay'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 曲名の逐次検索。1 文字ごとに結果を出す。
 * 検索インデックスは事前構築済みなので、入力ごとの再計算は配列走査だけで済む。
 */
export function SearchOverlay({
  open,
  initialQuery = '',
  onClose,
  onSelectSong,
  onSelectEdition,
}: {
  open: boolean
  /** 開いた直後に入力欄へ入れておく語。統計のボカロ P 名から飛んで来るときに使う。 */
  initialQuery?: string
  onClose: () => void
  onSelectSong: (song: Song) => void
  onSelectEdition: (slug: string) => void
}) {
  const { t } = useLocale()
  const { catalog, searchIndex } = useCatalog()
  const [query, setQuery] = useState(initialQuery)
  const inputRef = useRef<HTMLInputElement>(null)
  const { selected, toggle, reset, filtering } = useVocaloidFilter()

  // 絞り込みは入力に比べて重いので、1 つ前の結果を出したまま裏で計算させる。
  // 入力欄の反応が落ちない代わりに、結果の反映が 1 フレーム遅れることがある。
  const deferredQuery = useDeferredValue(query)
  const hits = useMemo(() => {
    const found = searchSongs(searchIndex, deferredQuery)
    if (!filtering) return found
    return found.filter((hit) =>
      singersOfSong(catalog, searchIndex, hit.song.title).some((id) => selected.has(id)),
    )
  }, [catalog, searchIndex, deferredQuery, filtering, selected])
  const stale = deferredQuery !== query

  // 開いた瞬間だけ初期状態へ戻す。initialQuery を入れ、絞り込みは全員 on に戻して
  // 渡された語の結果が絞り込みで欠けないようにする。
  // 効果ではなく描画中に合わせるのは、一度描いてから中身が入れ替わるのを避けるため。
  // 閉じるときに捨てないのは、フェードアウトの途中で結果が消えて見えるのを防ぐため。
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setQuery(initialQuery)
      reset()
    }
  }

  useEffect(() => {
    if (!open) return
    // アニメーション開始後にフォーカスするとモバイルでキーボードが安定して出る
    const id = window.setTimeout(() => inputRef.current?.focus(), 60)
    return () => window.clearTimeout(id)
  }, [open])

  useOverlay(open, onClose)

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
          aria-label={t('search.open')}
        >
          <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 py-3">
            <LuSearch aria-hidden className="text-muted shrink-0" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('search.placeholder')}
              aria-label={t('search.placeholder')}
              className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label={t('search.close')}
              className="text-muted shrink-0 rounded-lg p-2 transition hover:bg-black/5"
            >
              <LuX />
            </button>
          </div>

          <div className="mx-auto w-full max-w-3xl px-4 pb-2">
            <VocaloidFilter selected={selected} onToggle={toggle} />
          </div>

          <div
            className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-8 transition-opacity"
            style={{ opacity: stale ? 0.6 : 1 }}
            aria-busy={stale}
          >
            {deferredQuery.trim() === '' ? null : hits.length === 0 ? (
              <p className="text-muted py-10 text-center text-sm">{t('search.empty')}</p>
            ) : (
              <>
                <p className="text-muted mb-2 text-xs">
                  {t('search.results', { count: hits.length })}
                </p>
                <ul className="grid gap-1">
                  {hits.map((hit) => (
                    <li key={hit.song.title}>
                      <SongSearchResult
                        hit={hit}
                        onSelectSong={onSelectSong}
                        onSelectEdition={onSelectEdition}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
